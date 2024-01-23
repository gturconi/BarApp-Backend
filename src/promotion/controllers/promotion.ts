import { Request, Response } from 'express';
import sharp from 'sharp';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';
import * as QueryConstants from './queryConstants';

import { handleServerError } from '../../shared/errorHandler';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';
import { Promotion } from '../models/promotion';

export const getPromotions = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.limit as string) || 10;

  const search = (req.query.search as string) || '';
  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.COUNT_PROMOTIONS,
      [search]
    );

    const totalPromotions = totalRows[0].total;
    const totalPages = Math.ceil(totalPromotions / perPage);
    const startIndex = (page - 1) * perPage;

    const [promotions] = await pool.query<DbQueryResult<Promotion[]>>(
      QueryConstants.SELECT_PROMOTIONS,
      [search, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse(promotions, totalPromotions, page, totalPages)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de promociones',
      errorNumber: 500,
    });
  }
};
