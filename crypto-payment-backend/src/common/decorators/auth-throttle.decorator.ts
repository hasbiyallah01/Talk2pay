import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

// Custom throttle decorator for authentication endpoints
export function AuthThrottle() {
  return applyDecorators(
    // Allow only 5 login attempts per minute per IP
    Throttle({ default: { ttl: 60000, limit: 5 } }),
  );
}

// Custom throttle decorator for registration endpoints
export function RegisterThrottle() {
  return applyDecorators(
    // Allow only 3 registration attempts per 5 minutes per IP
    Throttle({ default: { ttl: 300000, limit: 3 } }),
  );
}