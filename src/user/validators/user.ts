import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const validatorUser: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        tel: req.body.tel,
        baja: req.body.baja,
      };

      const isPutRequest = req.method === "PUT";
      const optional =
        req.originalUrl === "/api/auth/signin" || req.method === "PUT";

      const nameValidation = z
        .string({
          required_error: "El campo nombre no puede estar vacío",
          invalid_type_error: "El campo nombre debe ser una cadena de texto",
        })
        .regex(/^[A-Za-z\s]+$/, {
          message: "El campo nombre debe contener solo letras",
        })
        .min(1, {
          message: "El campo nombre debe tener al menos un caracter",
        });

      const emailValidation = z
        .string({
          required_error: "El campo email no puede estar vacío",
          invalid_type_error: "El campo email debe ser una cadena de texto",
        })
        .email({
          message: "El campo email debe ser una dirección de correo válida",
        });

      const passValidation = z
        .string({
          required_error: "El campo contraseña no puede estar vacío",
          invalid_type_error:
            "El campo contraseña debe ser una cadena de texto",
        })
        .min(1, { message: "El campo contraseña no puede estar vacío" });

      const telValidation = z
        .string({
          required_error: "El campo telefono no puede estar vacío",
          invalid_type_error: "El campo telefono debe ser una cadena de texto",
        })
        .regex(/^\d+$/, {
          message: "El campo teléfono debe contener solo números",
        });

      const roleValidation = z
        .string({
          required_error: "El campo rol no puede estar vacío",
          invalid_type_error: "El campo rol debe ser una cadena de texto",
        })
        .regex(/^[A-Za-z\s]+$/, {
          message: "El campo nombre debe contener solo letras",
        })
        .min(1, { message: "El campo rol no puede estar vacío" });

      const baja = z
        .number({
          invalid_type_error: "El campo baja debe ser un número",
        })
        .refine((value) => value === 0 || value === 1, {
          message: "El campo baja debe ser 0 o 1",
        });

      const schema = z.object({
        name: optional ? nameValidation.optional() : nameValidation,
        email: isPutRequest ? emailValidation.optional() : emailValidation,
        password: isPutRequest ? passValidation.optional() : passValidation,
        role: roleValidation.optional(),
        tel: optional ? telValidation.optional() : telValidation,
        baja: baja.optional(),
      });

      const validatedData = schema.safeParse(req.body);

      if (validatedData.success) {
        next();
      } else {
        return res
          .status(400)
          .json({ message: validatedData.error.formErrors.fieldErrors });
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  },
];

export default validatorUser;
