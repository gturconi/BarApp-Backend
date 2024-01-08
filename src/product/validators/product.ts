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
        name: req.body.name,
        description: req.body.description,
        image: req.file,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        idCat: req.body.idCat ? parseInt(req.body.idCat) : undefined,
        promotions: req.body.promotions,
        baja:
          req.body.baja !== null && req.body.baja !== undefined
            ? parseInt(req.body.baja)
            : undefined,
        stock: req.body.stock ? parseInt(req.body.stock) : undefined,
      };

      const isPutRequest = req.method === "PUT";

      const nameValidation = z
        .string({
          required_error: "El campo nombre no puede estar vacío",
          invalid_type_error: "El campo nombre debe ser una cadena de texto",
        })
        .min(1, {
          message: "El campo nombre debe tener al menos un caracter",
        });

      const descriptionValidation = z
        .string({
          required_error: "El campo descripción no puede estar vacío",
          invalid_type_error:
            "El campo descripción debe ser una cadena de texto",
        })
        .min(1, {
          message: "El campo descripción debe tener al menos un caracter",
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

      const priceValidation = z
        .number({
          invalid_type_error: "El campo precio debe ser un número",
        })
        .min(0, {
          message: "El campo precio debe ser mayor a 0",
        });

      const idCatValidation = z.number({
        invalid_type_error: "El campo tipo de producto debe ser un número",
      });

      const promotionsValidation = z.array(
        z.number({
          invalid_type_error:
            "El campo promociones debe ser un arreglo de números",
        })
      );

      const baja = z
        .number({
          invalid_type_error: "El campo baja debe ser un número",
        })
        .refine((value) => value === 0 || value === 1, {
          message: "El campo baja debe ser 0 o 1",
        });

      const stock = z
        .number({
          invalid_type_error: "El campo stock debe ser un número",
        })
        .refine((value) => value === 0 || value === 1, {
          message: "El campo stock debe ser 0 o 1",
        });

      const schema = z.object({
        name: isPutRequest ? nameValidation.optional() : nameValidation,
        description: isPutRequest
          ? descriptionValidation.optional()
          : descriptionValidation,
        image: isPutRequest ? imageValidation.optional() : imageValidation,
        price: isPutRequest ? priceValidation.optional() : priceValidation,
        idCat: isPutRequest ? idCatValidation.optional() : idCatValidation,
        promotions: promotionsValidation.optional(),
        baja: baja.optional(),
        stock: stock.optional(),
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
