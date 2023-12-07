import { User } from "../models/user";
import { Role } from "../../role/models";
import { ROLES } from "../../role/models";
import { Request, Response } from "express";

import { DbQueryInsert, DbQueryResult } from "../../shared/queryTypes";
import pool from "../../shared/db/conn";
import * as QueryConstants from "../../shared/queryConstants";

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USER_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "No se obtuvo el usuario con ese id" });
  }
};
