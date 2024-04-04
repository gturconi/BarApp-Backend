import { Request, Response } from 'express';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';

import * as OrderConstants from './queryConstants';
import * as TableQueryConstants from '../../table/controllers/queryConstants';
import * as UserQueryConstants from '../../user/controllers/queryConstants';

import { handleServerError } from '../../shared/errorHandler';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';
import { Order } from '../models/order';
import { ROLES } from '../../role/models/role';

import {
  checkExistingOrderState,
  checkExistingProducts,
  checkExistingPromotions,
  checkExistingTables,
  checkExistingUnconfirmedOrder,
  checkExistingUsers,
  checkTableState,
} from '../../utils/checkOrder';
import { OrderDetail } from '../models/orderDetail';
import { User } from '../../user/models/user';

export const getOrders = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;

  const search = (req.query.search as string) || '';

  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      OrderConstants.COUNT_ORDERS,
      [search, search, search, search, search, search]
    );

    const totalOrders = totalRows[0].total;

    const perPage = parseInt(req.query.limit as string) || totalOrders;

    const totalPages = Math.ceil(totalOrders / perPage);
    const startIndex = (page - 1) * perPage;

    const [orders] = await pool.query<DbQueryResult<Order[]>>(
      OrderConstants.SELECT_ORDERS,
      [search, search, search, search, search, search, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse(orders, totalOrders, page, totalPages)
    );
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de Pedidos',
      errorNumber: 500,
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<Order[]>>(
      OrderConstants.SELECT_ORDER_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return handleServerError({
        res,
        message: 'Pedido no encontrado',
        errorNumber: 404,
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener el pedido',
      errorNumber: 500,
    });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;

  const { id } = req.params;

  try {
    const [userFounded] = await pool.query<DbQueryResult<User[]>>(
      UserQueryConstants.SELECT_USER_BY_ID,
      [id]
    );

    if (userFounded.length <= 0) {
      return handleServerError({
        res,
        message: 'Usuario no encontrado',
        errorNumber: 404,
      });
    }

    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      OrderConstants.COUNT_ORDERS,
      [null, null, userFounded[0].name, null, null, null]
    );

    const totalOrders = totalRows[0].total;

    const perPage = parseInt(req.query.limit as string) || totalOrders;

    const totalPages = Math.ceil(totalOrders / perPage);
    const startIndex = (page - 1) * perPage;

    const [orders] = await pool.query<DbQueryResult<Order[]>>(
      OrderConstants.SELECT_USER_ORDERS,
      [userFounded[0].id, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse(orders, totalOrders, page, totalPages)
    );
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de Pedidos',
      errorNumber: 500,
    });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  let connection = null;
  try {
    const { tableId, userId, total, orderDetails } = req.body;

    for (const orderDetail of orderDetails) {
      if (orderDetail.productId != undefined) {
        if (!(await checkExistingProducts(orderDetail))) {
          return handleServerError({
            res,
            message: `El producto con id ${orderDetail.productId} no existe`,
            errorNumber: 400,
          });
        }
      } else if (orderDetail.promotionId != undefined) {
        if (!(await checkExistingPromotions(orderDetail))) {
          return handleServerError({
            res,
            message: `La promocion con id ${orderDetail.promotionId} no existe`,
            errorNumber: 400,
          });
        }
      } else {
        return handleServerError({
          res,
          message: `El producto o promocion con id ${orderDetail.productId} no existe`,
          errorNumber: 400,
        });
      }
    }

    if (!(await checkExistingTables(tableId))) {
      return handleServerError({
        res,
        message: `La mesa con id ${tableId} no existe`,
        errorNumber: 400,
      });
    }

    if (!(await checkTableState(tableId, userId))) {
      return handleServerError({
        res,
        message: `La mesa con id ${tableId} ya se encuentra ocupada por otro cliente`,
        errorNumber: 400,
      });
    }

    if (!(await checkExistingUsers(userId, ROLES[0]))) {
      return handleServerError({
        res,
        message: `El cliente con id ${userId} no existe`,
        errorNumber: 400,
      });
    }

    /* if (!(await checkExistingUsers(employeeId, ROLES[2]))) {
      return handleServerError({
        res,
        message: `El empleado con id ${employeeId} no existe`,
        errorNumber: 400,
      });
    }*/

    if (await checkExistingUnconfirmedOrder(userId)) {
      return handleServerError({
        res,
        message: 'El cliente ya tiene un pedido pendiente',
        errorNumber: 400,
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    const savedOrder = await pool.query<DbQueryInsert>(
      OrderConstants.INSERT_ORDER,
      [tableId, userId, 1, total, null, null, null]
    );

    for (const orderDetail of orderDetails as OrderDetail[]) {
      if (orderDetail.productId != undefined) {
        await pool.query<DbQueryInsert>(OrderConstants.INSERT_ORDER_DETAIL, [
          savedOrder[0].insertId,
          orderDetail.productId,
          null,
          orderDetail.quantity,
          orderDetail.unitPrice,
          orderDetail.comments,
        ]);
      } else if (orderDetail.promotionId != undefined) {
        await pool.query<DbQueryResult<OrderDetail[]>>(
          OrderConstants.INSERT_ORDER_DETAIL,
          [
            savedOrder[0].insertId,
            null,
            orderDetail.promotionId,
            orderDetail.quantity,
            orderDetail.unitPrice,
            orderDetail.comments,
          ]
        );
      }
    }

    await pool.query<DbQueryInsert>(TableQueryConstants.UPDATE_TABLE, [
      null,
      2,
      tableId,
    ]);

    await connection.commit();

    if (savedOrder[0].affectedRows <= 0) {
      return res.status(200).json(savedOrder);
    }

    const insertedOrderId = savedOrder[0].insertId;

    const [OrderInserted] = await pool.query<DbQueryResult<Order[]>>(
      OrderConstants.SELECT_ORDER_BY_ID,
      [insertedOrderId]
    );

    res.status(201).send({ order: OrderInserted[0] });
  } catch (error) {
    console.error(error);
    if (connection) await connection.rollback();
    return handleServerError({
      res,
      message: 'Ocurrio un error al crear el pedido',
      errorNumber: 500,
    });
  } finally {
    if (connection) await connection.release();
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  let connection = null;
  try {
    const { id } = req.params;

    const [existingOrders] = await pool.query<DbQueryResult<any[]>>(
      OrderConstants.SELECT_ORDER_BY_ID,
      [id]
    );

    if (existingOrders.length == 0) {
      return handleServerError({
        res,
        message: 'El pedido no existe',
        errorNumber: 400,
      });
    }

    if (existingOrders[0].state.id != 1) {
      return handleServerError({
        res,
        message: 'No es posible eliminar un pedido ya confirmado',
        errorNumber: 400,
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    await pool.query<DbQueryResult<OrderDetail[]>>(
      OrderConstants.DELETE_ORDER_DETAIL,
      [id]
    );

    await pool.query<DbQueryResult<Order[]>>(OrderConstants.DELETE_ORDER, [id]);

    await pool.query<DbQueryInsert>(TableQueryConstants.UPDATE_TABLE, [
      null,
      1,
      existingOrders[0].table_order.id,
    ]);

    await connection.commit();
    return res.status(200).json({ message: 'Pedido eliminado exitosamente' });
  } catch (error) {
    if (connection) await connection.rollback();
    return handleServerError({
      res,
      message: 'Ocurrio un error al eliminar el pedido',
      errorNumber: 500,
      error,
    });
  } finally {
    if (connection) await connection.release();
  }
};

export const updateOrderState = async (req: Request, res: Response) => {
  let connection = null;
  try {
    const { id } = req.params;
    const { stateId } = req.body;

    if (!(await checkExistingOrderState(stateId))) {
      return handleServerError({
        res,
        message: 'El estado del pedido no existe',
        errorNumber: 400,
      });
    }

    const [orderFounded] = await pool.query<DbQueryResult<any[]>>(
      OrderConstants.SELECT_ORDER_BY_ID,
      [id]
    );

    if (orderFounded.length <= 0) {
      return handleServerError({
        res,
        message: 'Pedido no encontrado',
        errorNumber: 404,
      });
    }

    if (orderFounded[0].state.description == 'Pagado') {
      return handleServerError({
        res,
        message: 'No es posible cambiar el estado de un pedido ya pagado',
        errorNumber: 400,
      });
    }

    await pool.query<DbQueryResult<any[]>>(OrderConstants.UPDATE_ORDER_STATE, [
      stateId,
      id,
    ]);

    return res.status(200).json({ message: 'Estado del pedido actualizado' });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al eliminar el pedido',
      errorNumber: 500,
      error,
    });
  }
};
