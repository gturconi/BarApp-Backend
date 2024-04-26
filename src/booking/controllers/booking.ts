import { Request, Response } from 'express';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';

import { Booking, BookingDay, BookingState } from '../models/booking';
import * as QueryConstants from '../controllers/queryConstants';
import * as UserConstants from '../../user/controllers/queryConstants';
import * as TableConstants from '../../table/controllers/queryConstants';

import { handleServerError } from '../../shared/errorHandler';
import { EntityListResponse } from '../../shared/models/entity.list.response.model';
import { User } from '../../user/models/user';
import { Table } from '../../table/models/table';

export const getBookings = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;

  const search = (req.query.search as string) || '';

  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.COUNT_BOOKINGS,
      [search, search, search]
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
      [search, search, search, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse<Booking>(bookings, totalBookings, page, totalPages)
    );
  } catch (error) {
    console.error(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de reservas',
      errorNumber: 500,
    });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [booking] = await pool.query<DbQueryResult<Booking[]>>(
      QueryConstants.SELECT_BOOKING_BY_ID,
      [id]
    );
    if (booking.length <= 0) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    return res.json(booking[0]);
  } catch (error) {
    console.error(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la reserva',
      errorNumber: 500,
    });
  }
};

export const insertBooking = async (req: Request, res: Response) => {
  try {
    const { date_hour, userId, quota } = req.body;

    const [existingUser] = await pool.query<DbQueryResult<User[]>>(
      UserConstants.SELECT_USER_BY_ID,
      [userId]
    );

    if (existingUser.length <= 0) {
      return handleServerError({
        res,
        message: 'El usuario no existe',
        errorNumber: 400,
      });
    }

    let bookingTime =
      date_hour.getHours() +
      ':' +
      date_hour.getMinutes() +
      ':' +
      date_hour.getSeconds();

    const [bookingDays] = await pool.query<DbQueryResult<BookingDay[]>>(
      QueryConstants.SELECT_BOOKING_DAYS
    );
    let bookingDay = bookingDays.find((bookingDay) => {
      return (
        bookingDay.day_of_week == date_hour.getDay() &&
        bookingDay.init_hour <= bookingTime &&
        bookingDay.end_hour >= bookingTime
      );
    });

    if (!bookingDay) {
      return handleServerError({
        res,
        message: 'La fecha y hora de la reserva no se encuentra disponible',
        errorNumber: 400,
      });
    }

    const [bookingInserted] = await pool.query<DbQueryInsert>(
      QueryConstants.INSERT_BOOKING,
      [date_hour, userId, BookingState.Pendiente, quota, bookingDay.id]
    );

    const [newBooking] = await pool.query<DbQueryResult<Booking[]>>(
      QueryConstants.SELECT_BOOKING_BY_ID,
      bookingInserted.insertId
    );

    res.status(201).send({ booking: newBooking[0] });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al crear la reserva',
      errorNumber: 500,
    });
  }
};
