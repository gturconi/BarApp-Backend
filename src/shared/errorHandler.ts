import express, { Request, Response } from "express";

export const handleServerError = ({
  res,
  message,
  errorNumber,
  token,
  error,
}: {
  res: Response;
  message: string;
  errorNumber: number;
  token?: string | null;
  error?: any;
}) => {
  switch (error.code) {
    case "ER_DUP_ENTRY":
      return res.status(errorNumber).json({
        token,
        message:
          "No se pudo actualizar la información. La entrada que intentas guardar ya existe",
      });
    case "ER_ROW_IS_REFERENCED_2":
      return res.status(errorNumber).json({
        token,
        message:
          "No se pudo borrar la información. La entrada que intentas borrar se encuentra referenciada",
      });
  }
  return res.status(errorNumber).json({ token, message: message });
};
