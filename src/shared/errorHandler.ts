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
  if (error) {
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
            "Lo siento, no podemos eliminar la información en este momento ya que está siendo utilizada en otro lugar",
        });
    }
  }
  return res.status(errorNumber).json({ token, message: message });
};
