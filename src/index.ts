import app from './app';
import app2 from './socket';
import server from './socket';

// Db connection
import pool from './shared/db/conn';
pool;

// Settings
app.set('port', process.env.PORT || 3306);
app2.set('server_port', process.env.SERVER_PORT || 3000);
process.env.TZ = 'Etc/Universal';

// Starting the server
app.listen(app.get('port'), () => {
  console.log(`Server on port ${app.get('port')}`);
});

//Iniciamos el servidor de websocket
server.listen(app2.get('server_port'), () => {
  console.log(`Server running on port ${app2.get('server_port')}`);
});
