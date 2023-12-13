import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const MAX_FILE_SIZE = 4000000;

const validatorProductType: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        description: req.body.description,
        image: req.file,
      };

      const isPutRequest = req.method === "PUT";

      const descriptionValidation = z
        .string({
          required_error: "El campo descripción no puede estar vacío",
          invalid_type_error:
            "El campo descripción debe ser una cadena de texto",
        })
        .min(1, {
          message: "El campo descripción debe tener al menos un caracter",
        })
        .regex(/^[A-Za-z\s]+$/, {
          message: "El campo descripcion debe contener solo letras",
        });

      const imageValidation = z.object({
        originalname: z
          .string({
            required_error: "El campo imagen no puede estar vacío",
          })
          .regex(/.(png|jpg|jpeg)$/i, {
            message: "La imagen debe ser de formato PNG o JPG",
          }),
        buffer: z
          .instanceof(Buffer)
          .refine(
            (buffer) => buffer?.length <= MAX_FILE_SIZE,
            "El tamaño máximo permitido es 5MB"
          ),
      });

      const schema = z.object({
        description: isPutRequest
          ? descriptionValidation.optional()
          : descriptionValidation,
        image: isPutRequest ? imageValidation.optional() : imageValidation,
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

export default validatorProductType;
