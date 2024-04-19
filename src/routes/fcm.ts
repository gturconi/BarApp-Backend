import express from 'express';
import { handleServerError } from '../shared/errorHandler';
const { getMessaging } = require('firebase-admin/messaging');

const router = express.Router();

router.post('/send-notification', (req, res) => {
  const { title, body, receivedToken } = req.body;
  console.log(title, body, receivedToken);
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token:
      'dBpNAIKUSZ2ZuW3dqsG1_J:APA91bE-7VGeQWylsTbKDof21GXoY5m2tbkw43yNsjF1F_o6oUYzYogK2gfIiXaSY9-gTXnPi-1dh-HnItvsA5vj6g_IeCP_B1t4PJYdqtwVr8QbS99ogLtz9yYHjNgkO_uamlTh897s',
    // token: receivedToken,
  };

  // Enviar la notificación utilizando el SDK de Firebase Admin
  getMessaging()
    .send(message)
    .then((response: any) => {
      console.log('Successfully sent message:', response);
      // Response is a message ID string.
      res
        .status(200)
        .json({ message: 'Alerta enviada, en breve será atendido' });
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
});

export default router;
