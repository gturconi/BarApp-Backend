import { Request, Response } from 'express';
import sharp from 'sharp';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';
import * as QueryConstants from './queryConstants';

import { handleServerError } from '../../shared/errorHandler';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';
import { Table } from '../models/table';

export const getTables = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.limit as string) || 10;

  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.COUNT_TABLES
    );

    const totalProductsType = totalRows[0].total;
    const totalPages = Math.ceil(totalProductsType / perPage);
    const startIndex = (page - 1) * perPage;

    const [tables] = await pool.query<DbQueryResult<Table[]>>(
      QueryConstants.SELECT_TABLES,
      [startIndex, perPage]
    );
    return res.json(
      new EntityListResponse(tables, totalProductsType, page, totalPages)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la lista de mesas',
      errorNumber: 500,
    });
  }
};

export const getTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<Table[]>>(
      QueryConstants.SELECT_TABLE_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return handleServerError({
        res,
        message: 'Mesa no encontrada',
        errorNumber: 404,
      });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    console.log(error);
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener la mesa',
      errorNumber: 500,
    });
  }
};

export const insertTable = async (req: Request, res: Response) => {
  try {
    const { number, idState } = req.body;

    const [existingTable] = await pool.query<DbQueryResult<Table[]>>(
      QueryConstants.SELECT_TABLE_BY_NUMBER,
      [number]
    );

    if (existingTable.length > 0) {
      return handleServerError({
        res,
        message: 'La mesa ya existe',
        errorNumber: 409,
      });
    }

    const newTable = new Table(number, idState);

    const [savedTable] = await pool.query<DbQueryInsert>(
      QueryConstants.INSERT_TABLE,
      [newTable.number, newTable.idState]
    );

    if (savedTable.affectedRows <= 0) {
      return res.status(200).json(savedTable);
    }

    const insertedTableId = savedTable.insertId;

    const [newTableData] = await pool.query<DbQueryResult<Table[]>>(
      QueryConstants.SELECT_TABLE_BY_ID,
      [insertedTableId]
    );

    res.send({ table: newTableData[0] });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrió un error al insertar la mesa',
      errorNumber: 500,
    });
  }
};
