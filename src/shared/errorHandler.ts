import express, { Request, Response } from "express";

export const handleServerError = ({
  res,
  message,
  errorNumber,
  token,
}: {
  res: Response;
  message: string;
  errorNumber: number;
  token?: string | null;
}) => {
  return res.status(errorNumber).json({ token, message: message });
};
