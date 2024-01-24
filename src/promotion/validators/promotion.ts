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
        valid_from: new Date(req.body.valid_from),
        valid_to: new Date(req.body.valid_to),
        discount: req.body.discount,
        price: req.body.price,
        products: req.body.products,
        days: req.body.days,
        baja:
          req.body.baja !== null && req.body.baja !== undefined
            ? parseInt(req.body.baja)
            : undefined,
      };

      const isPutRequest = req.method === 'PUT';

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

      const validFromDateValidation = z.date({
        invalid_type_error: 'El campo valid_from debe ser una fecha válida',
      });

      const validToDateValidation = z.date({
        invalid_type_error: 'El campo valid_to debe ser una fecha válida',
      });

      const dates = z.object({
        valid_from: req.body.valid_from,
        valid_to: req.body.valid_to,
      });

      const validToGreaterThanFromValidation = dates.refine(
        (dates) => dates.valid_from < dates.valid_to,
        {
          message: 'El campo valid_to debe ser mayor que valid_from',
        }
      );

      const priceValidation = z
        .number({
          invalid_type_error: 'El campo precio debe ser un número',
        })
        .min(0, {
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

      const daysValidation = z.array(
        z.number({
          invalid_type_error: 'El campo dias debe ser un arreglo de números',
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
        valid_to: validToDateValidation
          .optional()
          .and(validToGreaterThanFromValidation)
          .optional(),
        discount: discountValidation.optional(),
        price: priceValidation.optional(),
        days: daysValidation.optional(),
        products: isPutRequest
          ? productsValidation.optional()
          : productsValidation,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
];

export default validatorPromotion;
