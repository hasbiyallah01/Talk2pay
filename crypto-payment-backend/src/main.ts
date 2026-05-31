import { config } from 'dotenv';
config(); // Load environment variables

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cors from 'cors';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SecurityConfig } from './common/config/security.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware - Helmet for security headers
  app.use(helmet(SecurityConfig.helmet));
  
  // CORS configuration
  app.use(cors(SecurityConfig.cors));
  
  // Global validation pipe with enhanced security
  app.useGlobalPipes(new ValidationPipe(SecurityConfig.validation));
  
  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Swagger/OpenAPI configuration - Always enable for now
  const swaggerConfig = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'Crypto Payment API Documentation',
  });
  
  console.log('Swagger UI available at /api');
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
