import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import pool from "../../shared/db/conn";

import { User } from "../models/user";
import { Role } from "../../role/models";
import { ROLES } from "../../role/models";

import { DbQueryInsert, DbQueryResult } from "../../shared/queryTypes";
import { UserRole } from "../../types/userRol";
import * as QueryConstants from "./queryConstants";
import { handleServerError } from "../../shared/errorHandler";

dotenv.config();
const secret = process.env.SECRET || "";

export const signupHandler = async (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body.role) {
      return handleServerError({
        res,
        message: "No se proporcionaron roles",
        errorNumber: 400,
      });
    }

    if (!ROLES.includes(req.body.role)) {
      return handleServerError({
        res,
        message: `El rol ${req.body.role} no existe`,
        errorNumber: 400,
      });
    }

    const { name, tel, email, password, role } = req.body;

    const [existingUsers] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USER_BY_EMAIL,
      [email]
    );

    if (existingUsers.length > 0) {
      return handleServerError({
        res,
        message: "El usuario ya existe",
        errorNumber: 409,
      });
    }

    const newUser = new User(name, tel, email, password);

    if (role) {
      const [rows] = await pool.query<DbQueryResult<Role[]>>(
        QueryConstants.SELECT_ROLE_BY_NAME,
        role
      );

      newUser.role = rows[0].id;
    } else {
      const [rows] = await pool.query<DbQueryResult<Role[]>>(
        QueryConstants.SELECT_ROLE_BY_NAME,
        "employee"
      );
      newUser.role = rows[0].id;
    }
    newUser.password = await User.encryptPassword(newUser.password);

    const [savedUser] = await pool.query<DbQueryInsert>(
      QueryConstants.INSERT_USER,
      [newUser.name, newUser.tel, newUser.email, newUser.password, newUser.role]
    );

    const token = generateToken(savedUser.insertId);

    return res.status(200).json({ token });
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al registrar el usuario",
      errorNumber: 500,
    });
  }
};

export const signinHandler = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<DbQueryResult<UserRole[]>>(
      QueryConstants.SELECT_USER_BY_EMAIL,
      [req.body.email]
    );

    if (rows.length === 0) {
      return handleServerError({
        res,
        message: "Usuario no encontrado",
        errorNumber: 404,
      });
    }

    const userFound = rows[0];

    const matchPassword = await User.comparePasswords(
      req.body.password,
      userFound.password
    );

    if (!matchPassword)
      return handleServerError({
        res,
        message: "Contraseña incorrecta",
        errorNumber: 401,
        token: null,
      });

    const token = generateToken(userFound.id);

    res.json({ token });
  } catch (error) {
    return handleServerError({
      res,
      message: "Ocurrio un error al iniciar sesión",
      errorNumber: 500,
    });
  }
};

const generateToken = (userId: number): string => {
  return jwt.sign({ id: userId }, secret, {
    expiresIn: 86400,
  });
};
