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
  if (error.code === "ER_DUP_ENTRY")
    return res.status(errorNumber).json({
      token,
      message:
        "No se pudo actualizar la información. La entrada que intentas guardar ya existe",
    });
  return res.status(errorNumber).json({ token, message: message });
};
