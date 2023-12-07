import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import pool from "../../shared/db/conn";

import { User } from "../models/user";
import { Role } from "../../role/models";
import { ROLES } from "../../role/models";

import { DbQueryInsert, DbQueryResult } from "../../shared/queryTypes";
import { UserRole } from "../../types/userRol";
import * as QueryConstants from "../../shared/queryConstants";

dotenv.config();
const secret = process.env.SECRET || "";

export const signupHandler = async (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body.role) {
      return res.status(400).json({ message: "No se proporcionaron roles" });
    }

    if (!ROLES.includes(req.body.role)) {
      return res.status(400).json({
        message: `El rol ${req.body.role} no existe`,
      });
    }

    const { name, tel, email, password, role } = req.body;

    const [existingUsers] = await pool.query<DbQueryResult<User[]>>(
      QueryConstants.SELECT_USER_BY_EMAIL,
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "El usuario ya existe" });
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

    const token = jwt.sign({ id: savedUser.insertId }, secret, {
      expiresIn: 86400,
    });

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Ocurrió un error" });
  }
};

export const signinHandler = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<DbQueryResult<UserRole[]>>(
      QueryConstants.SELECT_USER_BY_EMAIL,
      [req.body.email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const userFound = rows[0];

    const matchPassword = await User.comparePasswords(
      req.body.password,
      userFound.password
    );

    if (!matchPassword)
      return res.status(401).json({
        token: null,
        message: "Contraseña incorrecta",
      });

    const token = jwt.sign({ id: userFound.id }, secret, {
      expiresIn: 86400,
    });
    res.json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Ocurrió un error" });
  }
};
