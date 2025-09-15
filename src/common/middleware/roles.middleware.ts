import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RolesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userRole = req.headers['x-user-role'];

    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  }
}
