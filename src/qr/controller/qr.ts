import { Request, Response } from 'express';
import pool from '../../shared/db/conn';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { handleServerError } from '../../shared/errorHandler';

import * as TableQueryConstants from '../../table/controllers/queryConstants';
import { INSERT_QRS, SELECT_QRS, DELETE_QRS } from './queryConstants';
import { Table } from '../../table/models/table';
import { DbQueryResult } from '../../shared/queryTypes';

dotenv.config();
const secret = process.env.SECRET || '';

export const generateQrs = async (req: Request, res: Response) => {
  let connection = null;
  try {
    let tokens = [];

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await pool.query<DbQueryResult<any[]>>(DELETE_QRS);

    const [tables] = await pool.query<DbQueryResult<Table[]>>(
      TableQueryConstants.SELECT_ALL_TABLES
    );

    for (let i = 0; i < tables.length; i++) {
      tokens.push(jwt.sign({ number: tables[i].number }, secret));
      await pool.query<DbQueryResult<any[]>>(INSERT_QRS, [
        tables[i].number,
        tokens[i],
      ]);
    }
    await connection.commit();

    return res.status(200).json(tokens);
  } catch (error) {
    if (connection) await connection.rollback();
    return handleServerError({
      res,
      message: 'Ocurrio un error al generar los codigos',
      errorNumber: 500,
    });
  } finally {
    if (connection) await connection.release();
  }
};

export const getQrs = async (req: Request, res: Response) => {
  try {
    const [qrs] = await pool.query<DbQueryResult<any[]>>(SELECT_QRS);

    return res.status(200).json(qrs);
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al generar los codigos',
      errorNumber: 500,
    });
  }
};
