import { Request, Response } from "express";

import { DbQueryResult } from "../../shared/queryTypes";
import pool from "../../shared/db/conn";
import * as QueryConstants from "./queryConstants";
import { handleServerError } from "../../shared/errorHandler";

import { EntityListResponse } from "../../shared/models/entity.list.response.model";
import { Role } from "../models/role";

export const getRoles = async (req: Request, res: Response) => {
  try {

    const [roles] = await pool.query<DbQueryResult<Role[]>>(
      QueryConstants.SELECT_ROLES,
    );

    return res.json(
      new EntityListResponse(roles, roles.length, 1, 1)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener la lista de roles",
      errorNumber: 500,
    });
  }
};