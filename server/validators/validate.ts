import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = (err as any).issues || (err as any).errors || [];
        const formattedErrors = issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message,
        }));

        res.status(400).json({
          success: false,
          message: `Validation failed: ${formattedErrors.length} constraint violation(s) detected.`,
          errors: formattedErrors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        message: 'Invalid request body format.',
      });
    }
  };
}
