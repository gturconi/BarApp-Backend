import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { customErrorMap } from '../../shared/utils/customErrorMap';

z.setErrorMap(customErrorMap);

const validatorBooking: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        date_hour: req.body.date_hour
          ? new Date(req.body.date_hour)
          : undefined,
        userId: req.body.userId ? parseInt(req.body.userId) : undefined,
        quota: req.body.quota,
        stateId: req.body.stateId ? parseInt(req.body.userId) : undefined,
      };

      const isPutRequest = req.method === 'PUT';

      const date_hourValidation = z
        .date({
          invalid_type_error: 'El campo date_hour debe ser una fecha',
        })
        .refine((date) => date >= new Date(), {
          message:
            'El campo date_hour debe ser una fecha posterior a la fecha actual',
        });

      const userIdValidation = z
        .number({
          invalid_type_error: 'El campo userId debe ser un número',
        })
        .int({
          message: 'El campo userId debe ser un número entero',
        });

      const quotaValidation = z
        .number({
          invalid_type_error: 'El campo quota debe ser un número',
        })
        .int({
          message: 'El campo quota debe ser un número entero',
        });

      const stateIdValidation = z
        .number({
          invalid_type_error: 'El campo stateId debe ser un número',
        })
        .int({
          message: 'El campo stateId debe ser un número entero',
        });

      const schema = z.object({
        date_hour: isPutRequest
          ? date_hourValidation.optional()
          : date_hourValidation,
        userId: isPutRequest ? userIdValidation.optional() : userIdValidation,
        quota: isPutRequest ? quotaValidation.optional() : quotaValidation,
        stateId: stateIdValidation.optional(),
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

export default validatorBooking;
