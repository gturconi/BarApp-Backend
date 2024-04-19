import express from 'express';
const { getMessaging } = require('firebase-admin/messaging');

const router = express.Router();

router.post('/send-notification', (req, res) => {
  const { title, body, receivedToken } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: receivedToken,
  };

  // Enviar la notificación utilizando el SDK de Firebase Admin
  getMessaging()
    .send(message)
    .then((response: any) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error: any) => {
      console.log('Error sending message:', error);
    });
});
