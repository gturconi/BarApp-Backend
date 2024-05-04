import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { DbQueryInsert, DbQueryResult } from '../../shared/queryTypes';
import pool from '../../shared/db/conn';

import { handleServerError } from '../../shared/errorHandler';
import * as QueryConstants from '../../user/controllers/queryConstants';
import * as OrderConstants from '../../order/controllers/queryConstants';

import { EntityListResponse } from '../../shared/models/entity.list.response.model';

const { getMessaging } = require('firebase-admin/messaging');

export const sendNotification = async (req: Request, res: Response) => {
  let tokens: string[] = [];
  let title = req.body.title;
  let body = req.body.body;
  let receivedToken = req.body.receivedToken;
  let userId = req.body.userId;

  console.log('Notification title : ', title);
  console.log('User id : ', userId);

  if (
    title == 'Solicitud de asistencia en mesa' ||
    title == 'Solicitud de asistencia en mesa X' ||
    title == 'Pago realizado'
  ) {
    tokens = await searchEmployeeFcmTokens();

    if (
      title == 'Solicitud de asistencia en mesa X' ||
      title == 'Nuevo pedido'
    ) {
      title = title.replace('X', '');
      body = body.replace('X', getTable(receivedToken));
    }
  } else if (
    title == 'Estado del pedido actualizado' ||
    title == '¡Reserva Confirmada!' ||
    title == 'Reserva Cancelada'
  ) {
    tokens = await searchCustomerFcmToken(userId);
  } else if (title == '¡Nueva Reserva Realizada!') {
    tokens = await searchAdminFcmToken();
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    tokens: tokens,
    // token: receivedToken,
  };
  console.log('message: ', message);
  console.log('token destiny: ', tokens);
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

async function searchCustomerFcmToken(id: string) {
  const [tokens] = await pool.query<DbQueryResult<any[]>>(
    QueryConstants.SELECT_CUSTOMER_FCM_TOKEN,
    [id]
  );
  return tokens.map((obj) => obj.fcm_token);
}

async function searchAdminFcmToken() {
  const [tokens] = await pool.query<DbQueryResult<any[]>>(
    QueryConstants.SELECT_ADMIN_FCM_TOKEN
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

export const notifyOrderPaided = async (orderId: string) => {
  let tokens: string[] = [];

  const [orderFounded] = await pool.query<DbQueryResult<any[]>>(
    OrderConstants.SELECT_ORDER_BY_ID,
    [orderId]
  );

  tokens = await searchEmployeeFcmTokens();

  const message = {
    notification: {
      title: 'Pago realizado',
      body: `Un pedido de la mesa ${orderFounded[0]?.table_order.number} ha sido pagado`,
    },
    tokens: tokens,
  };

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
      return;
    })
    .catch((error: any) => {
      console.log('Error sending message:', error);
      return error;
    });
};
