import { createPool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = createPool({
  host: process.env.HOST,
  port: 3306,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DBNAME,
});

async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('¡Conexión exitosa a la base de datos!');
    connection.release(); 
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
}

checkDatabaseConnection();
export default pool;
