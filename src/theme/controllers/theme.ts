import { Request, Response } from "express";

import { DbQueryInsert, DbQueryResult } from "../../shared/queryTypes";
import pool from "../../shared/db/conn";
import * as QueryConstants from "./queryConstants";

import { handleServerError } from "../../shared/errorHandler";

import { EntityListResponse } from "../../shared/models/entity.list.response.model";

import { Theme } from "../models/theme";

export const getTheme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<Theme[]>>(
      QueryConstants.SELECT_THEME_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return handleServerError({
        res,
        message: "Tema no encontrado",
        errorNumber: 404,
      });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener el tema",
      errorNumber: 500,
    });
  }
};

export const updateTheme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const updateTheme = await pool.query<DbQueryInsert>(
      QueryConstants.UPDATE_THEME,
      [updateData.cssProperties, id]
    );

    if (updateTheme[0].affectedRows <= 0) {
      return res.status(200).json(updateTheme);
    }

    const [newTheme] = await pool.query<DbQueryResult<Theme[]>>(
      QueryConstants.SELECT_THEME_BY_ID,
      [id]
    );

    res.send(newTheme[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al actualizar el tema",
      errorNumber: 500,
      error,
    });
  }
};
