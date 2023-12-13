import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
    port:  Number(process.env.SMPT_PORT) ,
    host: String(process.env.SMPT_HOST),
    secure: String(process.env.SMPT_SECURE),
    auth: {
      user: process.env.BAREMAIL,
      password: process.env.BARPASS,
    },
  });

export { transporter };
