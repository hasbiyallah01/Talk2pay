import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Log suspicious requests
    this.logSuspiciousActivity(req);
    
    // Add security headers
    this.addSecurityHeaders(res);
    
    // Sanitize request body
    this.sanitizeRequest(req);
    
    next();
  }

  private logSuspiciousActivity(req: Request) {
    const suspiciousPatterns = [
      /script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload/i,
      /onerror/i,
      /<.*>/,
      /union.*select/i,
      /drop.*table/i,
      /insert.*into/i,
    ];

    const requestData = JSON.stringify({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(requestData)
    );

    if (isSuspicious) {
      this.logger.warn(`Suspicious request detected from ${req.ip}`, {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        body: req.body,
        query: req.query,
      });
    }
  }

  private addSecurityHeaders(res: Response) {
    // Additional security headers not covered by Helmet
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }

  private sanitizeRequest(req: Request) {
    // Remove null bytes and control characters
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
    
    // For query parameters, we need to sanitize in place since query is read-only
    if (req.query) {
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
          const sanitized = this.sanitizeObject(req.query[key]);
          // Use Object.defineProperty to modify the read-only query object
          Object.defineProperty(req.query, key, {
            value: sanitized,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
    }
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return obj.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }
}