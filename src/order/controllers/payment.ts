import { Request, Response } from 'express';
import { DbQueryResult } from '../../shared/queryTypes';
import { handleServerError } from '../../shared/errorHandler';
import pool from '../../shared/db/conn';

import mercadopago from 'mercadopago';
import { PreferenceItem } from 'mercadopago/models/preferences/create-payload.model';
import { PreferenceCreateResponse } from 'mercadopago/resources/preferences';

import { OrderDetail } from '../models/orderDetail';
import { User } from '../../user/models/user';
import { OrderState } from '../models/order';

import * as userConstants from '../../user/controllers/queryConstants';
import * as orderConstants from './queryConstants';
import * as tableConstants from '../../table/controllers/queryConstants';

import { notifyOrderPaided } from '../../fcm/controllers/fcm';

export const createOrder = async (req: Request, res: Response) => {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_API_KEY as string,
  });
  const isMobileApp = req.headers['user-agent']?.includes('Mobile');
  console.log(' isMobileApp: ', isMobileApp);
  const id = req.params.id;
  const array: PreferenceItem[] = [];
  let details!: OrderDetail[];

  const [orderFounded] = await pool.query<DbQueryResult<any[]>>(
    orderConstants.SELECT_ORDER_BY_ID,
    [id]
  );
  console.log(' orderFounded:', orderFounded);
  if (orderFounded.length <= 0) {
    return handleServerError({
      res,
      message: 'Pedido no encontrado',
      errorNumber: 404,
    });
  }

  if (orderFounded[0].state.description != 'Entregado') {
    return handleServerError({
      res,
      message: 'Solo es posible pagar un pedido en estado Entregado',
      errorNumber: 400,
    });
  }

  details = orderFounded[0].orderDetails;

  details.forEach((detail) => {
    array.push({
      id: detail.productId
        ? detail.productId.toString()
        : detail.promotionId?.toString(),
      unit_price: detail.unitPrice,
      currency_id: 'ARS',
      quantity: detail.quantity,
      title: 'Pedido Nro: ' + detail.orderId,
      description: 'Pedido Nro: ' + id,
    });
  });

  const [payer] = await pool.query<DbQueryResult<User[]>>(
    userConstants.SELECT_USER_BY_ID,
    [orderFounded[0].user.id]
  );

  // let redirectUrl = `${process.env.FRONT_HOST}/orders/my-orders/confirmed`;
  let redirectUrl = `${process.env.FRONT_HOST}/orders/my-orders/confirmed/details/${id}?success=true`;

  try {
    const result: PreferenceCreateResponse =
      await mercadopago.preferences.create({
        items: array,
        payment_methods: {
          installments: 1,
        },
        payer: {
          name: payer[0].name,
          email: payer[0].email,
        },

        back_urls: {
          success: redirectUrl,
          pending: redirectUrl,
          failure: redirectUrl,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACK_HOST}/api/payment/webhook/${id}`,
      });
    console.log('result: ', result.body.init_point);
    res.json(result.body.init_point);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Ocurrio un error al procesar el pago' });
  }
};

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const payment: any = req.query;
    const { id } = req.params;
    let connection = null;
    console.log('payment: ', payment);
    if (payment && typeof payment === 'object' && payment.type === 'payment') {
      const data: any = await mercadopago.payment.findById(
        payment['data.id'] as number
      );

      try {
        connection = await pool.getConnection();

        await connection.beginTransaction();

        await pool.query<DbQueryResult<any[]>>(
          orderConstants.UPDATE_ORDER_STATE,
          [OrderState.Pagado, id]
        );

        const { date_created, payer, payment_method_id, status } = data.body;

        const { transaction_details } = data.response;

        await pool.query<DbQueryResult<any[]>>(orderConstants.SAVE_TICKET, [
          id,
          date_created,
          payer.email,
          payment_method_id,
          status,
          transaction_details.total_paid_amount,
        ]);

        await connection.commit();

        notifyOrderPaided(id);
      } catch (error) {
        console.log('payment error: ', error);
        return handleServerError({
          res,
          message: 'Ocurrio un error al procesar el pago',
          errorNumber: 500,
          error,
        });
      }
    }

    res.sendStatus(204);
  } catch (error) {
    console.log('payment error: ', error);
    return res
      .status(500)
      .json({ message: 'Ocurrio un error al procesar el pago' });
  }
};

export const createOrderCash = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    let connection = null;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();
      const [orderFounded] = await pool.query<DbQueryResult<any[]>>(
        orderConstants.SELECT_ORDER_BY_ID,
        [id]
      );

      if (orderFounded.length <= 0) {
        return handleServerError({
          res,
          message: 'Pedido no encontrado',
          errorNumber: 404,
        });
      }
      if (orderFounded[0].state.description != 'Entregado') {
        return handleServerError({
          res,
          message: 'Solo es posible pagar un pedido en estado Entregado',
          errorNumber: 400,
        });
      }
      await pool.query<DbQueryResult<any[]>>(
        orderConstants.UPDATE_ORDER_STATE,
        [OrderState.Pagado, id]
      );

      await pool.query<DbQueryResult<any[]>>(tableConstants.UPDATE_TABLE, [
        null,
        1,
        orderFounded[0].table_order.id,
      ]);

      const currentDate = new Date();
      const argentinaDate = new Date(
        currentDate.toLocaleString('en-US', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })
      );
      const formattedDate = argentinaDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      const ticketData = {
        orderId: id,
        date_created: formattedDate,
        payer_email: orderFounded[0].user.email,
        payment_method_id: 'cash_payment',
        status: 'approved',
        total_paid_amount: orderFounded[0].total,
      };
      await pool.query<DbQueryResult<any[]>>(orderConstants.SAVE_TICKET, [
        ticketData.orderId,
        ticketData.date_created,
        ticketData.payer_email,
        ticketData.payment_method_id,
        ticketData.status,
        ticketData.total_paid_amount,
      ]);
      await connection.commit();
      res.sendStatus(204);
    } catch (error) {
      return handleServerError({
        res,
        message: 'Ocurrio un error al procesar el pago',
        errorNumber: 500,
        error,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Ocurrio un error al procesar el pago' });
  }
};
