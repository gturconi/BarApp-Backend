import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app2 = express();
export const webSocketApp = createServer(app2);

const io = new Server(webSocketApp, {
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
});

io.on('connection', async (socket) => {
  console.log('a user has connected!');

  socket.on('disconnect', () => {
    console.log('an user has disconnected');
  });

  socket.on('order', async (msg) => {
    console.log('evento order');
  });
});

export default app2;
