import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard, AuthenticatedRequest } from './jwt-auth.guard';
import { JwtService, JwtPayload } from '../jwt.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
      const mockRequest: Partial<AuthenticatedRequest> = {
        headers: authHeader ? { authorization: authHeader } : {},
      };

      return {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;
    };

    it('should return true for valid Bearer token', () => {
      const token = 'valid.jwt.token';
      const authHeader = `Bearer ${token}`;
      const mockPayload: JwtPayload = {
        merchantId: 'merchant_123',
        phoneNumber: '+2348012345678',
      };

      mockJwtService.verifyToken.mockReturnValue(mockPayload);

      const context = createMockExecutionContext(authHeader);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith(token);

      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      expect(request.user).toEqual({
        merchantId: 'merchant_123',
        phoneNumber: '+2348012345678',
      });
    });

    it('should throw UnauthorizedException when no authorization header', () => {
      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Access token is required');
    });

    it('should throw UnauthorizedException when authorization header is empty', () => {
      const context = createMockExecutionContext('');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Access token is required');
    });

    it('should throw UnauthorizedException when token type is not Bearer', () => {
      const context = createMockExecutionContext('Basic sometoken');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Access token is required');
    });

    it('should throw UnauthorizedException when token verification fails', () => {
      const token = 'invalid.jwt.token';
      const authHeader = `Bearer ${token}`;

      mockJwtService.verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = createMockExecutionContext(authHeader);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid or expired token');
      expect(mockJwtService.verifyToken).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException when token is expired', () => {
      const token = 'expired.jwt.token';
      const authHeader = `Bearer ${token}`;

      mockJwtService.verifyToken.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const context = createMockExecutionContext(authHeader);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Invalid or expired token');
    });

    it('should handle malformed Bearer token format', () => {
      const context = createMockExecutionContext('Bearer');

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow('Access token is required');
    });
  });
});