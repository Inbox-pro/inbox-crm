import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { usersDb, SafeUser, Role } from '../db/usersDb';
import { User } from '../models/User';
import { isDbConnected } from '../db/connection';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
  tokenPayload?: {
    id: string;
    email: string;
    role: Role;
    organizationId: string;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: Role;
      organizationId: string;
    };

    let safeUser: SafeUser | null = null;

    if (isDbConnected()) {
      const dbUser = await User.findOne({ id: decoded.id });
      if (dbUser && dbUser.status === 'Active') {
        safeUser = (typeof (dbUser as any).toSafeUser === 'function' ? (dbUser as any).toSafeUser() : dbUser.toJSON()) as SafeUser;
      }
    }

    if (!safeUser) {
      const userRecord = usersDb.findById(decoded.id);
      if (userRecord && userRecord.status === 'Active') {
        safeUser = usersDb.toSafeUser(userRecord);
      }
    }

    if (!safeUser) {
      res.status(401).json({
        success: false,
        message: 'Invalid session: User account is inactive or not found.',
      });
      return;
    }

    req.user = safeUser;
    req.tokenPayload = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Your role (${req.user.role}) does not have permission to access this resource.`,
      });
      return;
    }

    next();
  };
}

