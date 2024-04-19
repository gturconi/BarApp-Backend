import app from './app';
import app2 from './socket';
import { webSocketApp } from './socket';

const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');

// Db connection
import pool from './shared/db/conn';
pool;

//Firebase Admin
admin.initializeApp({
  credential: applicationDefault(),
  projectId: 'barapp-1b377',
});

// Settings
app.set('port', process.env.PORT || 3306);
app2.set('server_port', process.env.SERVER_PORT || 3000);
process.env.TZ = 'Etc/Universal';

// Starting the server
app.listen(app.get('port'), () => {
  console.log(`Server on port ${app.get('port')}`);
});

//Iniciamos el servidor de websocket
webSocketApp.listen(app2.get('server_port'), () => {
  console.log(`Server running on port ${app2.get('server_port')}`);
});
