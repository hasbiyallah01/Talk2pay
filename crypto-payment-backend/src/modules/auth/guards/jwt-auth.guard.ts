import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../jwt.service';

export interface AuthenticatedRequest extends Request {
  user: {
    merchantId: string;
    phoneNumber: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    console.log('JWT Guard - Authorization header:', request.headers.authorization);
    console.log('JWT Guard - Extracted token:', token ? 'Token present' : 'No token');

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const payload = this.jwtService.verifyToken(token);
      console.log('JWT Guard - Token verified, payload:', payload);
      request.user = {
        merchantId: payload.merchantId,
        phoneNumber: payload.phoneNumber,
      };
      return true;
    } catch (error) {
      console.log('JWT Guard - Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}