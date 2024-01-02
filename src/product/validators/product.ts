import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { MAX_FILE_SIZE } from "../../shared/constants";
import { detectImageFormat } from "../../shared/utils/detectImageFormat";

const validatorProduct: ((
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

      const nameValidation = z
        .string({
          required_error: "El campo nombre no puede estar vacío",
          invalid_type_error: "El campo nombre debe ser una cadena de texto",
        })
        .min(1,{
          message: "El campo nombre debe tener al menos un caracter",
        })
        .regex(/^[A-Za-z\s]+$/, {
            message: "El campo nombre debe contener solo letras",
        });

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
        originalname: z.string({
          invalid_type_error: "Formato invalido",
        }),
        buffer: z
          .instanceof(Buffer)
          .refine(
            (buffer) => buffer?.length <= MAX_FILE_SIZE,
            "El tamaño máximo permitido es 5MB"
          )
          .refine((buffer) => {
            const validImageFormats = ["image/jpeg", "image/png"];
            const detectedFormat = detectImageFormat(buffer);

            return validImageFormats.includes(detectedFormat!);
          }, "El formato de la foto debe ser jpg o png"),
      });

      const productTypeIdValidation = z
        .number({
          invalid_type_error: "El campo tipo de producto debe ser un número",
        })

      const schema = z.object({
        name: isPutRequest ? nameValidation.optional() : nameValidation,
        description: isPutRequest
          ? descriptionValidation.optional()
          : descriptionValidation,
        image: isPutRequest ? imageValidation.optional() : imageValidation,
        productTypeId: isPutRequest ? productTypeIdValidation.optional() : productTypeIdValidation
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

export default validatorProduct;
