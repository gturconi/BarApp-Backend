import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { MAX_FILE_SIZE } from '../../shared/constants';
import { detectImageFormat } from '../../shared/utils/detectImageFormat';
import { customErrorMap } from '../../shared/utils/customErrorMap';

z.setErrorMap(customErrorMap);

const validatorPromotion: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        description: req.body.description,
        image: req.file,
        valid_from: req.body.valid_from
          ? new Date(req.body.valid_from)
          : undefined,
        valid_to: req.body.valid_to ? new Date(req.body.valid_to) : undefined,
        discount: req.body.discount ? parseFloat(req.body.discount) : undefined,
        price:
          req.body.price !== null &&
          req.body.price !== undefined &&
          req.body.price !== 'undefined'
            ? parseFloat(req.body.price)
            : undefined,
        products: req.body.products ? JSON.parse(req.body.products) : undefined,
        days_of_week: req.body.days_of_week
          ? JSON.parse(req.body.days_of_week)
          : undefined,
        baja:
          req.body.baja !== null && req.body.baja !== undefined
            ? parseInt(req.body.baja)
            : undefined,
      };
      const isPutRequest = req.method === 'PUT';

      if (
        req.body.valid_to &&
        req.body.valid_from &&
        req.body.valid_to < req.body.valid_from
      ) {
        return res.status(400).json({
          message: 'La fecha hasta debe ser mayor que la fecha desde',
        });
      }

      if (
        !isPutRequest &&
        ((req.body.valid_to && !req.body.valid_from) ||
          (!req.body.valid_to && req.body.valid_from))
      ) {
        return res.status(400).json({
          message: 'Una de las fechas es nula',
        });
      }

      const descriptionValidation = z
        .string({
          required_error: 'El campo descripción no puede estar vacío',
          invalid_type_error:
            'El campo descripción debe ser una cadena de texto',
        })
        .min(1, {
          message: 'El campo descripción debe tener al menos un caracter',
        });

      const imageValidation = z.object({
        originalname: z.string({
          invalid_type_error: 'Formato invalido',
        }),
        buffer: z
          .instanceof(Buffer)
          .refine(
            (buffer) => buffer?.length <= MAX_FILE_SIZE,
            'El tamaño máximo permitido es 5MB'
          )
          .refine((buffer) => {
            const validImageFormats = ['image/jpeg', 'image/png'];
            const detectedFormat = detectImageFormat(buffer);

            return validImageFormats.includes(detectedFormat!);
          }, 'El formato de la foto debe ser jpg o png'),
      });

      const validFromDateValidation = z.coerce.date({
        invalid_type_error: 'El campo valid_from debe ser una fecha válida',
      });

      const validToDateValidation = z.coerce.date({
        invalid_type_error: 'El campo valid_to debe ser una fecha válida',
      });

      const priceValidation = z
        .number({
          invalid_type_error: 'El campo precio debe ser un número',
        })
        .min(1, {
          message: 'El campo precio debe ser mayor a 0',
        });

      const discountValidation = z
        .number({
          invalid_type_error: 'El campo descuento debe ser un número',
        })
        .refine((value) => value >= 0 && value <= 1, {
          message: 'El campo descuento debe ser un número flotante entre 0 y 1',
        });

      const productsValidation = z.array(
        z.number({
          invalid_type_error:
            'El campo productos debe ser un arreglo de números',
        })
      );

      const days_of_weekValidation = z.array(
        z
          .number({
            invalid_type_error: 'El campo dias debe ser un arreglo de números',
          })
          .refine((day) => day >= 0 && day <= 6, {
            message: 'El campo dias debe ser un número entre 0 y 6',
          })
      );

      const baja = z
        .number({
          invalid_type_error: 'El campo baja debe ser un número',
        })
        .refine((value) => value === 0 || value === 1, {
          message: 'El campo baja debe ser 0 o 1',
        });

      const schema = z.object({
        description: isPutRequest
          ? descriptionValidation.optional()
          : descriptionValidation,
        image: isPutRequest ? imageValidation.optional() : imageValidation,
        valid_from: validFromDateValidation.optional(),
        valid_to: validToDateValidation.optional(),
        discount: discountValidation.optional(),
        price: priceValidation.optional(),
        days_of_week: days_of_weekValidation.optional(),
        products: isPutRequest
          ? productsValidation.optional()
          : productsValidation,
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
      console.log(error);
      return res.status(500).json(error);
    }
  },
];

export default validatorPromotion;
