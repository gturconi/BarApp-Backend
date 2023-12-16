import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import sharp from "sharp";

import { DbQueryInsert, DbQueryResult } from "../../shared/queryTypes";
import pool from "../../shared/db/conn";
import * as QueryConstants from "./queryConstants";
import { handleServerError } from "../../shared/errorHandler";

import { EntityListResponse } from "../../shared/models/entity.list.response.model";
import { User } from "../models/user";

const encrypt = async (passwordPlain: string): Promise<string> => {
  const hash = await bcryptjs.hash(passwordPlain, 10);
  return hash;
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USER_BY_ID,
      [id]
    );

    if (rows.length <= 0) {
      return handleServerError({
        res,
        message: "Usuario no encontrado",
        errorNumber: 404,
      });
    }
    return res.status(200).json(rows[0]);
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener el usuario",
      errorNumber: 500,
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.limit as string) || 10;

  const search = (req.query.search as string) || "";

  try {
    const [totalRows] = await pool.query<DbQueryResult<any[]>>(
      QueryConstants.COUNT_USERS,
      [search, search, search, search]
    );

    const totalUsers = totalRows[0].total;
    const totalPages = Math.ceil(totalUsers / perPage);
    const startIndex = (page - 1) * perPage;

    const [users] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USERS,
      [search, search, search, search, startIndex, perPage]
    );

    return res.json(
      new EntityListResponse(users, totalUsers, page, totalPages)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al obtener la lista de usuarios",
      errorNumber: 500,
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    let resizedAvatar = null;
    const { id } = req.params;
    const updateData = { ...req.body };
    const newAvatar = req.file;

    if (newAvatar) {
      resizedAvatar = Buffer.from([]);
      resizedAvatar = await sharp(newAvatar.buffer).resize(400).toBuffer();
    }

    if (updateData.password) {
      updateData.password = await encrypt(updateData.password);
    }

    const updateUser = await pool.query<DbQueryInsert>(
      QueryConstants.UPDATE_USER,
      [
        updateData.name,
        updateData.tel,
        updateData.email,
        updateData.password,
        updateData.rol_id,
        updateData.baja,
        resizedAvatar ? resizedAvatar : null,
        id,
      ]
    );

    if (updateUser[0].affectedRows <= 0) {
      return res.status(200).json(updateUser);
    }

    const [newUser] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USER_BY_ID,
      [id]
    );

    newUser[0].password = "";

    res.send({ user: newUser[0] });
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al actualizar el usuario",
      errorNumber: 500,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [newUser] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USER_BY_ID,
      [id]
    );
    if (!newUser[0]) {
      return handleServerError({
        res,
        message: "Usuario no encontrado",
        errorNumber: 404,
      });
    }
    await pool.query<DbQueryInsert>(QueryConstants.DELETE_USER, [id]);
    return res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al eliminar el usuario",
      errorNumber: 500,
    });
  }
};
