import { createPool } from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = createPool({
  host: process.env.HOST,
  port: 3306,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DBNAME,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connection established successfully!");
  connection.release();
});

export default pool;
