import { z } from 'zod';
import { customErrorMap } from '../../shared/utils/customErrorMap';
import { orderDetailsSchema } from './orderDetailSchema';

z.setErrorMap(customErrorMap);

export const orderSchema = z.object({
  userId: z.number({
    invalid_type_error: 'El campo userId debe ser un número',
  }),

  employeeId: z
    .number({
      invalid_type_error: 'El campo employeeId debe ser un número',
    })
    .optional(),

  tableNumber: z.string({
    invalid_type_error: 'El campo tableNumber debe ser un string',
  }),

  idState: z
    .number({
      invalid_type_error: 'El campo idState debe ser un número',
    })
    .int({
      message: 'El campo idState debe ser un número entero',
    })
    .min(1, {
      message: 'El campo idState solo puede asumir valores del 1 al 4',
    })
    .max(4, {
      message: 'El campo idState solo puede asumir valores del 1 al 4',
    }),

  total: z
    .number({
      invalid_type_error: 'El campo total debe ser un número',
    })
    .min(0, {
      message: 'El campo total debe ser mayor a 0',
    }),

  feedback: z
    .string({
      invalid_type_error: 'El campo feedback debe ser una cadena de texto',
    })
    .min(1, {
      message: 'El campo feedback debe tener al menos un caracter',
    })
    .optional(),

  score: z
    .number({
      invalid_type_error: 'El campo score debe ser un número',
    })
    .int({
      message: 'El campo score debe ser un número entero',
    })
    .refine((value) => value >= 0 && value <= 5, {
      message: 'El campo score debe ser un entero entre 0 o 5',
    })
    .optional(),

  orderDetails: orderDetailsSchema.array().nonempty({
    message: 'El campo orderDetails debe ser un arreglo no vacio',
  }),
});
