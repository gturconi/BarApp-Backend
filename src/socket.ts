import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import http from 'http';

const app2 = express();
export const server = http.createServer(app2);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200',
    // credentials: true,
    //   methods: ['GET', 'POST'],
  },
});

app2.use(cors());

app2.get('/', (req, res) => {
  res.send('socket server');
});

app2.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method, Access-Control-Allow-Credentials'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

io.on('connection', async (socket) => {
  console.log('a user has connected!');

  //Este mensaje se emite cuando un usuario se desconecta
  socket.on('disconnect', () => {
    console.log('an user has disconnected');
  });
  //Este callback se ejecuta cuando un usuario envia un mensaje
  socket.on('order', async (msg) => {
    console.log('evento order');
  });
});

export default app2;
