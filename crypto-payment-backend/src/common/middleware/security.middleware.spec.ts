import { SecurityMiddleware } from './security.middleware';
import { Request, Response, NextFunction } from 'express';

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new SecurityMiddleware();
    
    mockRequest = {
      ip: '127.0.0.1',
      method: 'POST',
      url: '/test',
      get: jest.fn().mockReturnValue('test-user-agent'),
      body: {},
      query: {},
      params: {},
    };
    
    mockResponse = {
      setHeader: jest.fn(),
    };
    
    nextFunction = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next function', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should add security headers', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  });

  it('should sanitize request body with null bytes', () => {
    mockRequest.body = {
      name: 'John\x00Doe',
      description: 'Test\x01Description',
    };

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockRequest.body.name).toBe('JohnDoe');
    expect(mockRequest.body.description).toBe('TestDescription');
  });

  it('should sanitize nested objects', () => {
    mockRequest.body = {
      user: {
        name: 'John\x00Doe',
        details: {
          bio: 'Developer\x01Bio',
        },
      },
    };

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockRequest.body.user.name).toBe('JohnDoe');
    expect(mockRequest.body.user.details.bio).toBe('DeveloperBio');
  });

  it('should sanitize arrays', () => {
    mockRequest.body = {
      tags: ['tag1\x00', 'tag2\x01', 'normal-tag'],
    };

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockRequest.body.tags).toEqual(['tag1', 'tag2', 'normal-tag']);
  });

  it('should sanitize query parameters', () => {
    mockRequest.query = {
      search: 'test\x00query',
      filter: 'category\x01filter',
    };

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockRequest.query.search).toBe('testquery');
    expect(mockRequest.query.filter).toBe('categoryfilter');
  });
});