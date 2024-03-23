import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { customErrorMap } from '../../shared/utils/customErrorMap';
import { orderSchema } from './orderSchema';

z.setErrorMap(customErrorMap);

const validatorOrder: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        userId: req.body.userId ? parseInt(req.body.userId) : undefined,
        employeeId: req.body.employeeId
          ? parseInt(req.body.employeeId)
          : undefined,
        tableId: req.body.tableId ? parseInt(req.body.tableId) : undefined,
        idState: req.body.idState ? parseInt(req.body.idState) : undefined,
        idPromotion: req.body.idPromotion
          ? parseInt(req.body.idPromotion)
          : undefined,
        total: req.body.total ? parseFloat(req.body.total) : undefined,
        feedback: req.body.feedback,
        score: req.body.score ? parseInt(req.body.score) : undefined,
        orderDetails: req.body.orderDetails,
      };

      const isPutRequest = req.method === 'PUT';

      const schema = isPutRequest ? orderSchema.optional() : orderSchema;

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

export default validatorOrder;
