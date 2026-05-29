import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  merchantId: string;
  phoneNumber: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  private readonly secret = 'your-secret-key'; // In production, use environment variable
  private readonly expiresIn = '24h';

  generateToken(payload: { merchantId: string; phoneNumber: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}