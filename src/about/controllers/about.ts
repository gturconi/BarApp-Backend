import { Request, Response } from 'express';

import { DbQueryResult } from '../../shared/queryTypes';
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



