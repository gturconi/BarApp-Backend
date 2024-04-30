import { Request, Response } from 'express';

import { DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';

import { handleServerError } from '../../shared/errorHandler';

import * as queryConstants from './queryConstants';
import {
  ProductSelled,
  TopCustomers,
  WeeklySalesHistory,
} from '../models/metrics';

export const getMostSelledProdcuts = async (req: Request, res: Response) => {
  try {
    const [metric] = await pool.query<DbQueryResult<ProductSelled[]>>(
      queryConstants.MOST_SELLED_PRODUCTS
    );

    if (metric.length <= 0) {
      return res.status(404).json({
        message: 'No se encontraron productos vendidos',
      });
    }
    return res.status(200).json(metric);
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la metrica',
      errorNumber: 500,
    });
  }
};

export const topFiveCustomers = async (req: Request, res: Response) => {
  try {
    const [metric] = await pool.query<DbQueryResult<TopCustomers[]>>(
      queryConstants.TOP_FIVE_CUSTOMERS
    );

    if (metric.length <= 0) {
      return res.status(404).json({
        message: 'No se encontraron pedidos',
      });
    }
    return res.status(200).json(metric);
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la metrica',
      errorNumber: 500,
    });
  }
};

export const weeklySalesHistory = async (req: Request, res: Response) => {
  try {
    const [metric] = await pool.query<DbQueryResult<WeeklySalesHistory[]>>(
      queryConstants.WEEKLY_SALES_HISTORY
    );

    if (metric.length <= 0) {
      return res.status(404).json({
        message: 'No se encontraron pedidos',
      });
    }
    return res.status(200).json(metric);
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la metrica',
      errorNumber: 500,
    });
  }
};
