import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { customErrorMap } from '../../shared/utils/customErrorMap';

z.setErrorMap(customErrorMap);

export const orderDetailsSchema = z.object({
  orderId: z.number().positive(),
  productId: z.number().positive().optional(),
  promotionId: z.number().positive().optional(),
  quantity: z.number().int().positive(),
});
