import { Request, Response } from 'express';
import { DbQueryResult } from '../../shared/queryTypes';
import { handleServerError } from '../../shared/errorHandler';
import pool from '../../shared/db/conn';

import mercadopago from 'mercadopago';
import { PreferenceItem } from 'mercadopago/models/preferences/create-payload.model';
import { PreferenceCreateResponse } from 'mercadopago/resources/preferences';

import { OrderDetail } from '../models/orderDetail';
import { User } from '../../user/models/user';

import { getUser } from '../../user/controllers/user';
import * as userConstants from '../../user/controllers/queryConstants';

export const createOrder = async (req: Request, res: Response) => {
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_API_KEY as string,
  });

  const {
    tableId,
    userId,
    idState,
    orderDetails,
    date_created,
    total,
    feedback,
    score,
  } = req.body;

  const array: PreferenceItem[] = [];
  const details: OrderDetail[] = orderDetails;

  details.forEach((detail) => {
    array.push({
      id: detail.id?.toString(),
      unit_price: detail.unitPrice,
      currency_id: 'ARS',
      quantity: detail.quantity,
      description: detail.comments,
    });
  });

  const [payer] = await pool.query<DbQueryResult<User[]>>(
    userConstants.SELECT_USER_BY_ID,
    [userId]
  );

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
          success: `${process.env.FRONT_HOST}/orders/my-orders`,
          pending: `${process.env.FRONT_HOST}/orders/my-orders`,
          failure: `${process.env.FRONT_HOST}/orders/my-orders`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.BACK_HOST}/api/payment/webhook`,
      });

    res.json(result.body.init_point);
  } catch (error) {
    return res.status(500).json({ message: 'Something goes wrong' });
  }
};

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const payment: any = req.query;

    console.log('payment: ', payment);
    if (payment && typeof payment === 'object' && payment.type === 'payment') {
      const data = await mercadopago.payment.findById(
        payment['data.id'] as number
      );
      console.log('data: ', data);
      //guardar en DB info:
      /*   
        order_id             
        date_created
        user_email        
        payment_method_id
        order
        payer
        status
        total_paid_amount
      */
    }

    res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something goes wrong' });
  }
};
