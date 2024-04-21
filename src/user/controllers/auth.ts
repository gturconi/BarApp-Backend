import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import pool from '../../shared/db/conn';
import nodemailer from 'nodemailer';
import bcryptjs from 'bcryptjs';

import { User } from '../models/user';
import { Role, ROLES } from '../../role/models/role';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import { UserRole } from '../../types/userRol';
import * as QueryConstants from './queryConstants';
import { handleServerError } from '../../shared/errorHandler';

dotenv.config();
const secret = process.env.SECRET || '';

type TransportOptions = {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
};

export const signupHandler = async (req: Request, res: Response) => {
  try {
    if (!req.body || !req.body.role) {
      return handleServerError({
        res,
        message: 'No se proporcionaron roles',
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
        message: 'El usuario ya existe',
        errorNumber: 409,
      });
    }

    const newUser = new User(name, tel, email, password, 0);

    if (role) {
      const [rows] = await pool.query<DbQueryResult<Role[]>>(
        QueryConstants.SELECT_ROLE_BY_NAME,
        role
      );

      newUser.role = rows[0].id;
    } else {
      const [rows] = await pool.query<DbQueryResult<Role[]>>(
        QueryConstants.SELECT_ROLE_BY_NAME,
        'employee'
      );
      newUser.role = rows[0].id;
    }
    newUser.password = await User.encryptPassword(newUser.password);

    const [savedUser] = await pool.query<DbQueryInsert>(
      QueryConstants.INSERT_USER,
      [
        newUser.name,
        newUser.tel,
        newUser.email,
        newUser.password,
        newUser.role,
        newUser.baja,
      ]
    );

    const token = generateToken(savedUser.insertId);

    return res.status(200).json({ token });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al registrar el usuario',
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
        message: 'Usuario no encontrado',
        errorNumber: 404,
      });
    }

    const userFound = rows[0];

    if (userFound.baja) {
      return handleServerError({
        res,
        message: 'El usuario no se encuentra habilitado',
        errorNumber: 404,
      });
    }

    const matchPassword = await User.comparePasswords(
      req.body.password,
      userFound.password
    );

    if (!matchPassword)
      return handleServerError({
        res,
        message: 'Contraseña incorrecta',
        errorNumber: 401,
        token: null,
      });

    if (req.body.fcm_token != null) {
      const [tokens] = await pool.query<DbQueryResult<string[]>>(
        QueryConstants.SELECT_FCM_TOKEN
      );
      console.log('tokens: ', tokens);
      console.log(
        'find: ',
        tokens.find((token) => token == req.body.fcm_token)
      );
      if (!tokens.find((token) => token == req.body.fcm_token)) {
        await pool.query<DbQueryInsert>(QueryConstants.UPDATE_FCM_TOKEN, [
          req.body.fcm_token,
          userFound.id,
        ]);
      }
    }

    const token = generateToken(userFound.id);

    res.json({ token });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al iniciar sesión',
      errorNumber: 500,
    });
  }
};

export const recoverPasswordHandler = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<DbQueryResult<UserRole[]>>(
      QueryConstants.SELECT_USER_BY_EMAIL,
      [req.body.email]
    );

    if (rows.length === 0) {
      return handleServerError({
        res,
        message: 'Usuario no encontrado',
        errorNumber: 404,
      });
    }

    const userFound = rows[0];

    const token = generateToken(userFound.id);

    await sendEmail(userFound, token);
    return res.status(200).json({
      message: 'Se ha enviado un correo para recuperar la contraseña',
    });
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al recuperar la contraseña',
      errorNumber: 500,
    });
  }
};

const generateToken = (userId: number): string => {
  return jwt.sign({ id: userId }, secret, {
    expiresIn: 3600,
  });
};

const sendEmail: (user: UserRole, token: string) => Promise<void> = async (
  user,
  token
) => {
  const resetPasswordUrl = `http://${process.env.FRONT_HOST}/auth/new-password/${token}`;

  const mailOptions = {
    from: 'Forgot Password <no-reply@example.com>',
    to: user.email,
    subject: 'Recuperación de contraseña',
    text: `
      Hola,
  
      Para restablecer tu contraseña, haz clic en el siguiente enlace:
    
      ${resetPasswordUrl}
      
      Este enlace caducará en 1 hora.
  
      Saludos,
      El equipo de TGD Net
    `,
  };

  const transporter = nodemailer.createTransport({
    port: process.env.SMPT_PORT,
    host: process.env.SMPT_HOST,
    secure: process.env.SMPT_SECURE,
    auth: {
      user: process.env.BAREMAIL,
      pass: process.env.BARPASS,
    },
  } as TransportOptions);
  try {
    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.log(e);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { password } = req.body;
  const newPassword = await bcryptjs.hash(password, 10);

  let token = req.headers['x-access-token'] as string;
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'object' && 'id' in decoded) {
    req.userId = decoded.id;
  }

  const [user] = await pool.query<DbQueryResult<User[]>>(
    QueryConstants.SELECT_USER_BY_ID,
    [req.userId]
  );

  if (!user[0]) {
    return handleServerError({
      res,
      message: 'Usuario no encontrado',
      errorNumber: 404,
    });
  }

  await pool.query<DbQueryInsert>(QueryConstants.UPDATE_USER, [
    null,
    null,
    null,
    newPassword,
    null,
    req.userId,
  ]);

  return res.status(200).json({
    message: 'La contraseña se actualizo correctamente',
  });
};
