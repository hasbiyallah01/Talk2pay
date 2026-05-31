import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cors from 'cors';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { SecurityConfig } from '../src/common/config/security.config';

let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Security middleware - Helmet for security headers
    app.use(helmet(SecurityConfig.helmet));
    
    // CORS configuration
    app.use(cors(SecurityConfig.cors));
    
    // Global validation pipe with enhanced security
    app.useGlobalPipes(new ValidationPipe(SecurityConfig.validation));
    
    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());
    
    // Swagger/OpenAPI configuration
    const config = new DocumentBuilder()
      .setTitle('Crypto Payment Backend API')
      .setDescription('A minimal backend API for merchant-first crypto payment toolkit. Enables small business owners to accept crypto payments through QR codes and payment links, track transactions, and export records.')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('auth', 'Authentication endpoints')
      .addTag('merchant', 'Merchant management endpoints')
      .addTag('payment', 'Payment request endpoints')
      .addTag('transaction', 'Transaction tracking endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    
    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  return app.getHttpAdapter().getInstance()(req, res);
}