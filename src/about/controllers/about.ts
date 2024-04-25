import { Request, Response } from 'express';
import nodemailer, { TransportOptions } from 'nodemailer';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';
import * as QueryConstants from './queryConstants';

import { handleServerError } from '../../shared/errorHandler';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';
 
import { Contact } from '../models/about';

export const getContact = async (req: Request, res: Response) => {
  try {
    const [contacts] = await pool.query<DbQueryResult<Contact[]>>(
      QueryConstants.SELECT_CONTACT,
    );
   return res.json(
      new EntityListResponse(contacts, contacts.length, 1, 1)
    );
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener el contacto',
      errorNumber: 500,
    });
  }
};

export const putContact = async (req: Request, res: Response) => {
  try {
    const {name, description, tel, address, contact_email, open_dayhr, id} = req.body;
    const [contacts] = await pool.query<DbQueryInsert>(
      QueryConstants.UPDATE_CONTACT,
      [name, description, tel, address, contact_email, open_dayhr, id]
    );
    if (contacts.affectedRows === 1) {
      return res.status(200).json(contacts);
    }
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener el contacto',
      errorNumber: 500,
    });
  }
};

export const postContact = async (req: Request, res: Response) => {
  try {
    const {name, description, tel, address, contact_email, open_dayhr} = req.body;
    const [contacts] = await pool.query<DbQueryInsert>(
      QueryConstants.INSERT_CONTACT,
      [name, description, tel, address, contact_email, open_dayhr]
    );
    if (contacts.affectedRows === 0) {
      return res.status(200).json(contacts);
    }
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al obtener el contacto',
      errorNumber: 500,
    });
  }
};

export const postEmailMessage = async (req: Request, res: Response) => {
  try {
    const {name, description, email} = req.body;
    const [contacts] = await pool.query<DbQueryResult<Contact[]>>(
      QueryConstants.SELECT_CONTACT,
    );
    const contactEmail = contacts?.[0]?.contact_email;
    if(contactEmail) {
      const mailOptions = {
        from: `${name} - ${email}`,
        to: contactEmail,
        subject: `${name} quiere contactarte`,
        text: description,
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
      await transporter.sendMail(mailOptions);
      res.status(200).send({success: true});
    }
  } catch (error) {
    return handleServerError({
      res,
      message: 'Ocurrio un error al enviar el email',
      errorNumber: 500,
    });
  }
};



