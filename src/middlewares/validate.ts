import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError.js';

interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validate = (schema: RequestValidationSchema | ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if ('safeParse' in schema && typeof schema.safeParse === 'function') {
        const parsed = await schema.parseAsync(req.body);
        req.body = parsed;
        return next();
      }

      const compositeSchema = schema as RequestValidationSchema;

      if (compositeSchema.body) {
        req.body = await compositeSchema.body.parseAsync(req.body);
      }
      if (compositeSchema.query) {
        const parsedQuery = (await compositeSchema.query.parseAsync(req.query)) as Request['query'];
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      }
      if (compositeSchema.params) {
        const parsedParams = (await compositeSchema.params.parseAsync(req.params)) as Request['params'];
        try {
          req.params = parsedParams;
        } catch {
          Object.defineProperty(req, 'params', {
            value: parsedParams,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError('Error de validación en los datos enviados', 400, formattedErrors));
      }
      next(error);
    }
  };
};
