import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { customErrorMap } from '../../shared/utils/customErrorMap';

z.setErrorMap(customErrorMap);

const validatorOrder: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        userId: req.body.idClient ? parseInt(req.body.userId) : undefined,
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
    } catch (error) {
      return res.status(500).json(error);
    }
  },
];

export default validatorOrder;
