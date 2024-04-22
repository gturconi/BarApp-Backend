import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';

import { handleServerError } from '../../shared/errorHandler';
import * as QueryConstants from '../../user/controllers/queryConstants';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';

const { getMessaging } = require('firebase-admin/messaging');

export const sendNotification = async (req: Request, res: Response) => {
  const { title, body, receivedToken } = req.body;
  console.log(title, body, receivedToken);

  let tokens: string[] = [];
  if (
    title == 'Solicitud de asistencia en mesa' ||
    title == 'Solicitud de asistencia en mesa X'
  ) {
    tokens = await searchEmployeeFcmTokens();

    if (title == 'Solicitud de asistencia en mesa X') {
      title.replace('X', '');
      body.replace('X', getTable(receivedToken));
    }
  }
  console.log(tokens);
  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: tokens,
    // token: receivedToken,
  };
  console.log('message: ', message);
  // Enviar la notificación utilizando el SDK de Firebase Admin
  getMessaging()
    .sendMulticast(message)
    .then((response: any) => {
      console.log('Successfully sent message:', response);

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp: any, idx: number) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
      }

      res.status(200);
    })
    .catch((error: any) => {
      console.log('Error sending message:', error);
      return handleServerError({
        res,
        message: 'Ocurrio un error',
        errorNumber: 500,
        error,
      });
    });
};

async function searchEmployeeFcmTokens() {
  const [tokens] = await pool.query<DbQueryResult<any[]>>(
    QueryConstants.SELECT_EMPLOYEE_FCM_TOKEN
  );

  return tokens.map((obj) => obj.fcm_token);
}

function getTable(token: string) {
  const secret = process.env.SECRET || '';
  const decodedToken = jwt.verify(token, secret);

  if (typeof decodedToken === 'object' && 'number' in decodedToken) {
    return decodedToken.number;
  }
}
