import { Request, Response } from 'express';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';

import { Booking } from '../models/booking';
import * as QueryConstants from '../controllers/queryConstants';

import { handleServerError } from '../../shared/errorHandler';
import { EntityListResponse } from '../../shared/models/entity.list.response.model';

export const getBookings = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;

  const search = (req.query.search as string) || '';

  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.COUNT_BOOKINGS,
      [search, search, search, search]
    );
    const totalBookings = totalRows[0].total || 0;
    let perPage = parseInt(req.query.limit as string) || totalBookings;

    if (totalBookings == 0) {
      perPage = 1;
    }
    const totalPages = Math.ceil(totalBookings / perPage);
    const startIndex = (page - 1) * perPage;

    const [bookings] = await pool.query<DbQueryResult<Booking[]>>(
      QueryConstants.SELECT_BOOKINGS,
      [search, search, search, search, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse<Booking>(bookings, totalBookings, page, totalPages)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de reservas',
      errorNumber: 500,
    });
  }
};
