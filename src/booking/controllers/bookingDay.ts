import { Request, Response } from 'express';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';

import { BookingDay } from '../models/booking';
import * as QueryConstants from '../controllers/queryConstants';

import { handleServerError } from '../../shared/errorHandler';

export const getBookingDays = async (req: Request, res: Response) => {
  try {
    const [bookingDays] = await pool.query<DbQueryResult<BookingDay[]>>(
      QueryConstants.SELECT_BOOKING_DAYS
    );

    return res.json(bookingDays);
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de días de reserva',
      errorNumber: 500,
    });
  }
};

export const getBookingDay = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [bookingDay] = await pool.query<DbQueryResult<BookingDay[]>>(
      QueryConstants.SELECT_BOOKING_DAY_BY_ID,
      [id]
    );

    if (bookingDay.length <= 0) {
      return handleServerError({
        res,
        message: 'No se encontro el dia de reserva',
        errorNumber: 404,
      });
    }

    return res.status(200).json(bookingDay[0]);
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de dias de reserva',
      errorNumber: 500,
    });
  }
};

export const insertBookingDay = async (req: Request, res: Response) => {
  const { day_of_week, init_hour, end_hour } = req.body;

  try {
    const [existingBookingDay] = await pool.query<DbQueryResult<BookingDay[]>>(
      QueryConstants.SEARCH_EXISTS_BOOKING_DAY,
      [day_of_week, init_hour, end_hour]
    );

    if (existingBookingDay.length > 0) {
      return handleServerError({
        res,
        message: 'Ya existe un dia de reserva con los mismos datos',
        errorNumber: 409,
      });
    }

    const [savedBookingDay] = await pool.query<DbQueryInsert>(
      QueryConstants.INSERT_BOOKING_DAY,
      [day_of_week, init_hour, end_hour]
    );

    if (savedBookingDay.affectedRows <= 0) {
      return res.status(200).json(savedBookingDay);
    }

    const insertedBookingDayId = savedBookingDay.insertId;

    const [newBookingDay] = await pool.query<DbQueryResult<BookingDay[]>>(
      QueryConstants.SELECT_BOOKING_DAY_BY_ID,
      [insertedBookingDayId]
    );

    res.send({ bookingDay: newBookingDay[0] });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrió un error al insertar el día de reserva',
      errorNumber: 500,
    });
  }
};

export const updateBookingDay = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { day_of_week, init_hour, end_hour } = req.body;

  try {
    const updatedBookingDay = new BookingDay(day_of_week, init_hour, end_hour);

    const [updated] = await pool.query<DbQueryInsert>(
      QueryConstants.UPDATE_BOOKING_DAY,
      [
        updatedBookingDay.day_of_week,
        updatedBookingDay.init_hour,
        updatedBookingDay.end_hour,
        id,
      ]
    );

    if (updated.affectedRows <= 0) {
      return res.status(200).json(updated);
    }

    const [newBookingDay] = await pool.query<DbQueryResult<BookingDay[]>>(
      QueryConstants.SELECT_BOOKING_DAY_BY_ID,
      [id]
    );
    res.send(newBookingDay[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrió un error al actualizar el día de reserva',
      errorNumber: 500,
    });
  }
};

export const deleteBookingDay = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [bookingDay] = await pool.query<DbQueryResult<BookingDay[]>>(
      QueryConstants.SELECT_BOOKING_DAY_BY_ID,
      [id]
    );

    if (!bookingDay[0]) {
      return handleServerError({
        res,
        message: 'No se encontro el día de reserva',
        errorNumber: 404,
      });
    }

    const [deleted] = await pool.query<DbQueryInsert>(
      QueryConstants.DELETE_BOOKING_DAY,
      [id]
    );

    return res
      .status(200)
      .json({ message: 'Día de reserva eliminado exitosamente' });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al eliminar el día de reserva',
      errorNumber: 500,
      error,
    });
  }
};
