import * as PromQueryConstants from '../promotion/controllers/queryConstants';
import * as ProdQueryConstants from '../product/controllers/queryConstants';
import * as UserQueryConstants from '../user/controllers/queryConstants';
import * as TableQueryConstants from '../table/controllers/queryConstants';
import * as OrderQueryConstants from '../order/controllers/queryConstants';

import { DbQueryResult } from '../shared/queryTypes';
import pool from '../shared/db/conn';

import { OrderDetail } from '../order/models/orderDetail';
import { Product } from '../product/models/product';
import { Promotion } from '../promotion/models/promotion';
import { TABLE_STATE, Table } from '../table/models/table';

export const checkExistingProducts = async (orderDetail: OrderDetail) => {
  try {
    const [existingProducts] = await pool.query<DbQueryResult<Product[]>>(
      ProdQueryConstants.SELECT_PRODUCT_BY_ID,
      [orderDetail.productId]
    );
    return existingProducts.length > 0 && !existingProducts[0].baja
      ? true
      : false;
  } catch (error) {
    return error;
  }
};

export const checkExistingPromotions = async (orderDetail: OrderDetail) => {
  try {
    const [existingPromotions] = await pool.query<DbQueryResult<Promotion[]>>(
      PromQueryConstants.SELECT_PROMOTION_BY_ID,
      [orderDetail.promotionId]
    );
    const currentDay = new Date().getDay();
    const currentDate = new Date();

    if (
      existingPromotions[0].days_of_week &&
      !existingPromotions[0].days_of_week?.includes(currentDay)
    )
      return false;

    if (
      existingPromotions[0].valid_from &&
      existingPromotions[0].valid_from > currentDate
    )
      return false;

    if (
      existingPromotions[0].valid_to &&
      existingPromotions[0].valid_to < currentDate
    )
      return false;

    return existingPromotions.length > 0 && !existingPromotions[0].baja
      ? true
      : false;
  } catch (error) {
    return error;
  }
};

export const checkExistingTables = async (id: string) => {
  try {
    const [existingTables] = await pool.query<DbQueryResult<Table[]>>(
      TableQueryConstants.SELECT_TABLE_BY_ID,
      [id]
    );

    return existingTables.length > 0 ? true : false;
  } catch (error) {
    return error;
  }
};

export const checkTableState = async (tableNumber: string, idUser: string) => {
  try {
    const [tableFounded] = await pool.query<DbQueryResult<Table[]>>(
      TableQueryConstants.SELECT_TABLE_BY_NUMBER,
      [tableNumber]
    );

    const [existingTables] = await pool.query<DbQueryResult<any[]>>(
      TableQueryConstants.SELECT_TABLE_BY_ID,
      [tableFounded[0].id]
    );

    let tableFound = existingTables[0];

    if (tableFound.state === TABLE_STATE[0]) return true;

    const [existingOrder] = await pool.query<DbQueryResult<any[]>>(
      OrderQueryConstants.CHECK_EXISTING_ORDER_IN_TABLE,
      [tableFounded[0].id]
    );

    return existingOrder.length > 0 && existingOrder[0].userId === idUser
      ? true
      : false;
  } catch (error) {
    return error;
  }
};

export const checkExistingUsers = async (id: string, role: string) => {
  try {
    const [existingUsers] = await pool.query<DbQueryResult<any[]>>(
      UserQueryConstants.SELECT_USER_BY_ID,
      [id]
    );
    return existingUsers.length > 0 &&
      !existingUsers[0].baja &&
      existingUsers[0].role === role
      ? true
      : false;
  } catch (error) {
    return error;
  }
};

export const checkExistingUnconfirmedOrder = async (id: string) => {
  try {
    const [existingOrders] = await pool.query<DbQueryResult<any[]>>(
      OrderQueryConstants.CHECK_EXISTING_UNCONFIRMED_ORDER,
      [id]
    );
    return existingOrders.length > 0 ? true : false;
  } catch (error) {
    return error;
  }
};

export const checkExistingOrderState = async (id: string) => {
  try {
    const [existingOrders] = await pool.query<DbQueryResult<any[]>>(
      OrderQueryConstants.CHECK_EXISTING_ORDER_STATE,
      [id]
    );

    return existingOrders.length > 0 ? true : false;
  } catch (error) {
    return error;
  }
};
