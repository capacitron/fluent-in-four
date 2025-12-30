import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler.js';

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(createError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }

  if (req.user.role !== 'admin') {
    next(createError(403, 'FORBIDDEN', 'Admin access required'));
    return;
  }

  next();
}
