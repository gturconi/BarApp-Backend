import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const validatorProductType: ((
  req: Request,
  res: Response,
  next: NextFunction
) => void)[] = [
  (req, res, next) => {
    try {
      req.body = {
        description: req.body.description,
      };

      const isPutRequest = req.method === "PUT";

      const descriptionValidation = z
        .string()
        .regex(/^[A-Za-z\s]+$/, {
          message: "El campo descripcion debe contener solo letras",
        })
        .min(1);

      const schema = z.object({
        description: isPutRequest ? descriptionValidation.optional() : descriptionValidation
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

export default validatorProductType;
