import app from "./app";

// Db connection
import pool from "./shared/db/conn";
pool;

// Settings
app.set("port", process.env.PORT || 3306);

// Starting the server
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
