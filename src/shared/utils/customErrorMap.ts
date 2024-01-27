import { z } from 'zod';

export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'number') {
      return {
        message: `El campo ${issue.path[0]} debe ser un número`,
      };
    }
    if (issue.expected === 'string') {
      return {
        message: `El campo ${issue.path[0]} debe ser una cadena de texto`,
      };
    }
    if (issue.expected === 'object') {
      return {
        message: `El formato del campo ${issue.path[0]} es invalido`,
      };
    }
    if (issue.expected === 'array') {
      return {
        message: `El campo ${issue.path[0]} debe ser un arreglo`,
      };
    }
  } else if (issue.code === z.ZodIssueCode.invalid_date) {
    return {
      message: `El campo ${issue.path[0]} no tiene un formato de fecha valido`,
    };
  }
  if (issue.code === z.ZodIssueCode.custom) {
    return { message: `less-than-${(issue.params || {}).minimum}` };
  }
  return { message: ctx.defaultError };
};
