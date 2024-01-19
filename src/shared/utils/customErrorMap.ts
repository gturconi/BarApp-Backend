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
  }
  if (issue.code === z.ZodIssueCode.custom) {
    return { message: `less-than-${(issue.params || {}).minimum}` };
  }
  return { message: ctx.defaultError };
};
