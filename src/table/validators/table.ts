import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { customErrorMap } from '../../shared/utils/customErrorMap';

z.setErrorMap(customErrorMap);

const validatorTable: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        number: req.body.number,
        idState: req.body.state ? parseInt(req.body.state) : undefined,
      };

      const isPutRequest = req.method === 'PUT';

      const numberValidation = z
        .number({
          invalid_type_error: 'El campo number debe ser un número',
        })
        .refine((number) => number > 0, {
          message: 'El numero de la mesa debe ser mayor a cero',
        });

      const stateValidation = z
        .number({
          invalid_type_error: 'El campo idState debe ser un número',
        })
        .refine((state) => state > 0, {
          message: 'El estado de la mesa debe ser mayor a cero',
        });

      const schema = z.object({
        number: isPutRequest ? numberValidation.optional() : numberValidation,
        idState: isPutRequest ? stateValidation.optional() : stateValidation,
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
export default validatorTable;
