import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { customErrorMap } from '../../shared/utils/customErrorMap';
import { orderSchema } from './orderSchema';
import { OrderDetail } from '../models/orderDetail';

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
        tableNumber: req.body.tableId,
        idState: req.body.idState ? parseInt(req.body.idState) : undefined,
        total: req.body.total ? parseFloat(req.body.total) : undefined,
        feedback: req.body.feedback,
        score: req.body.score ? parseInt(req.body.score) : undefined,
        orderDetails: req.body.orderDetails,
      };

      req.body.orderDetails = req.body.orderDetails.map((od: any) => {
        return {
          orderId: od.orderId ? parseInt(od.orderId) : undefined,
          productId: od.productId ? parseInt(od.productId) : undefined,
          promotionId: od.promotionId ? parseInt(od.promotionId) : undefined,
          quantity: od.quantity ? parseInt(od.quantity) : undefined,
          unitPrice: od.unitPrice ? parseFloat(od.unitPrice) : undefined,
          comments: od.comments ? od.comments : undefined,
        };
      });

      const isPutRequest = req.method === 'PUT';

      req.body.orderDetails.map((od: OrderDetail) => {
        if (
          !isPutRequest &&
          od.promotionId === undefined &&
          od.productId === undefined
        ) {
          return res.status(400).json({
            message:
              'El detalle del pedido debe tener al menos un producto o promocion asociado',
          });
        }
      });

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
      console.log(error);
      return res.status(500).json(error);
    }
  },
];

export default validatorOrder;
