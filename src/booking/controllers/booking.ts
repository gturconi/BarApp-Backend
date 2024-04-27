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

    const [checkExistingBooking] = await pool.query<DbQueryResult<Booking[]>>(
      QueryConstants.CHECK_EXISTING_BOOKING,
      [userId]
    );

    if (checkExistingBooking.length > 0) {
      return handleServerError({
        res,
        message:
          'No es posible registrar la reserva debido a que ya tiene una reserva pendiente',
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

export const getFutureBookings = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [bookings] = await pool.query<DbQueryResult<Booking[]>>(
      QueryConstants.GET_FUTURE_BOOKINGS,
      [id]
    );

    return res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de reservas',
      errorNumber: 500,
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [bookingFounded] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.SELECT_BOOKING_BY_ID,
      [id]
    );

    if (bookingFounded.length <= 0) {
      return handleServerError({
        res,
        message: 'Reserva no encontrada',
        errorNumber: 404,
      });
    }
    if (bookingFounded[0].state.id != BookingState.Pendiente) {
      return handleServerError({
        res,
        message: 'Solo es posible cancelar reservas pendientes',
        errorNumber: 400,
      });
    }

    await pool.query<DbQueryInsert>(QueryConstants.UPDATE_BOOKING_STATE, [
      BookingState.Cancelada,
      id,
    ]);

    return res.status(200).send({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al actualizar reservas',
      errorNumber: 500,
    });
  }
};

export const confirmBooking = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const [bookingFounded] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.SELECT_BOOKING_BY_ID,
      [id]
    );

    if (bookingFounded.length <= 0) {
      return handleServerError({
        res,
        message: 'Reserva no encontrada',
        errorNumber: 404,
      });
    }

    if (bookingFounded[0].state.id != BookingState.Pendiente) {
      return handleServerError({
        res,
        message: 'Solo es posible confirmar reservas pendientes',
        errorNumber: 400,
      });
    }

    await pool.query<DbQueryInsert>(QueryConstants.UPDATE_BOOKING_STATE, [
      BookingState.Confirmada,
      id,
    ]);
    return res.status(200).send({ message: 'Reserva confirmada exitosamente' });
  } catch (error) {
    console.error(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al actualizar reservas',
      errorNumber: 500,
    });
  }
};
