import { z } from 'zod';
import { customErrorMap } from '../../shared/utils/customErrorMap';

z.setErrorMap(customErrorMap);

export const orderDetailsSchema = z.object({
  orderId: z
    .number({
      invalid_type_error: 'El campo orden debe ser un número',
    })
    .positive({
      message: 'La orden debe ser un número positivo',
    })
    .optional(),
  productId: z.number().positive().optional(),
  promotionId: z
    .number({
      invalid_type_error: 'El campo promo debe ser un número',
    })
    .positive({
      message: 'La promo debe ser un número positivo',
    })
    .optional(),
  quantity: z
    .number({
      invalid_type_error: 'El campo cantidad debe ser un número',
    })
    .int({
      message: 'La cantidad debe ser un número entero',
    })
    .positive({
      message: 'La cantidad debe ser un número positivo',
    }),
  unitPrice: z
    .number({
      invalid_type_error: 'El campo precio debe ser un número',
    })
    .positive({
      message: 'El campo precio debe ser un número positivo',
    }),
  comments: z
    .string({
      invalid_type_error: 'El campo comentarios debe ser una cadena de texto',
    })
    .min(1, {
      message: 'El campo comentarios debe tener al menos un caracter',
    })
    .optional(),
});
