import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { Request, Response } from "express";
import { NextFunction } from "express";
import pool from "../shared/db/conn";

import { User } from "../user/models/user";
import { DbQueryResult } from "../shared/queryTypes";
import { UserRole } from "../types/userRol";
import * as QueryConstants from "../user/controllers/queryConstants";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = req.headers["x-access-token"] as string;
  const secret = process.env.SECRET || "";

  if (!token)
    return res.status(403).json({ message: "No se recibió ningún token" });
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "object" && "id" in decoded) {
      req.userId = decoded.id;
    }

    const [user] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USER_BY_ID_NO_JOIN,
      [req.userId]
    );

    if (!user)
      return res
        .status(404)
        .json({ message: "No se pudo encontrar el usuario" });

    if (user[0].baja)
      return res.status(401).json({ message: "No autorizado!" });

    next();
  } catch (error) {
    return res.status(401).json({ message: "No autorizado!" });
  }
}

export const validateIdentity = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers["x-access-token"] as string;
  const secret = process.env.SECRET || "";
  const { id } = req.params;

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === "object" && "id" in decoded) {
      id == decoded.id
        ? next()
        : res.status(401).send({ message: "No autorizado" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Ocurrió un error" });
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query<DbQueryResult<UserRole[]>>(
      QueryConstants.SELECT_USER_BY_ID,
      [req.userId]
    );
    if (rows && rows[0].roleName === "admin") {
      next();
      return;
    }
    return res
      .status(403)
      .json({ message: "Requiere permisos de administrador!" });
  } catch (error) {
    return res.status(500).send({ message: "Ocurrió un error" });
  }
};

export const isEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [rows] = await pool.query<DbQueryResult<UserRole[]>>(
      QueryConstants.SELECT_USER_BY_ID,
      [req.userId]
    );

    if (rows && rows[0].roleName === "employee") {
      next();
      return;
    }
    return res.status(403).json({ message: "Requiere permisos de empleado!" });
  } catch (error) {
    return res.status(500).send({ message: "Ocurrió un error" });
  }
};
