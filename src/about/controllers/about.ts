import { Request, Response } from 'express';

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



