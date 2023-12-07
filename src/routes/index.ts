import express from "express";
import fs from "fs";
import path from "path";

const app = express();

const pathRouter = __dirname; // ruta actual

// Función para eliminar la extensión .js del nombre de archivo
const removeExtension = (fileName: string) => {
  return fileName.split(".").shift()!;
};

fs.readdirSync(pathRouter).filter((file) => {
  const fileWithOutExt = removeExtension(file);
  const fileExtension = path.extname(file);

  const skip = ["index"].includes(fileWithOutExt) || fileExtension !== ".js";

  if (!skip) {
    const routePath = path.join(__dirname, fileWithOutExt);
    const routeModule = require(routePath).default; // Importa el módulo de la ruta

    // Verifica si el módulo de la ruta es un enrutador válido
    if (typeof routeModule === "function" && routeModule.stack) {
      app.use(`/${fileWithOutExt}`, routeModule); // Usa el enrutador
      console.log("CARGAR RUTA ---->", fileWithOutExt);
    }
  }
});

app.get("*", (req, res) => {
  res.status(404);
  res.send({ error: "Not found" });
});

export default app;
