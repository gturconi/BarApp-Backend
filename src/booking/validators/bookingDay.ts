import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { customErrorMap } from '../../shared/utils/customErrorMap';

z.setErrorMap(customErrorMap);

const validatorBookingDay: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        day_of_week: req.body.day_of_week,
        init_hour: req.body.init_hour,
        end_hour: req.body.end_hour,
      };

      const isPutRequest = req.method === 'PUT';

      const day_of_weekValidation = z
        .number({
          invalid_type_error: 'El campo day_of_week debe ser un número',
        })
        .refine((day) => day >= 0 && day <= 6, {
          message: 'El campo day_of_week debe ser un número entre 0 y 6',
        });

      const init_hourValidation = z
        .string({
          invalid_type_error: 'El campo init_hour debe ser una cadena de texto',
        })
        .length(5, {
          message: 'El campo init_hour debe tener una longitud de 5 caracteres',
        })
        .refine(
          (value) => {
            const pattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
            return pattern.test(value);
          },
          {
            message: 'El campo init_hour debe tener el formato HH:MM',
          }
        );
      const end_hourValidation = z
        .string({
          invalid_type_error: 'El campo end_hour debe ser una cadena de texto',
        })
        .length(5, {
          message: 'El campo end_hour debe tener una longitud de 5 caracteres',
        })
        .refine(
          (value) => {
            const pattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
            return pattern.test(value);
          },
          {
            message: 'El campo end_hour debe tener el formato HH:MM',
          }
        );

      const schema = z.object({
        day_of_week: isPutRequest
          ? day_of_weekValidation.optional()
          : day_of_weekValidation,
        init_hour: isPutRequest
          ? init_hourValidation.optional()
          : init_hourValidation,
        end_hour: isPutRequest
          ? end_hourValidation.optional()
          : end_hourValidation,
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

export default validatorBookingDay;
