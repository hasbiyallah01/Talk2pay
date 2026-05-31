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
    
    // Security middleware - Helmet for security headers with relaxed CSP for Swagger
    app.use(helmet({
      ...SecurityConfig.helmet,
      contentSecurityPolicy: {
        directives: {
          ...SecurityConfig.helmet.contentSecurityPolicy.directives,
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
          connectSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        },
      },
    }));
    
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
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Setup Swagger with minimal external dependencies for Vercel compatibility
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Crypto Payment API Documentation',
      customfavIcon: '/favicon.ico',
      // Use CDN that works better with Vercel
      customJs: [
        'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
      ],
      customCssUrl: [
        'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css',
      ],
    });

    // Also setup a JSON endpoint for the OpenAPI spec
    SwaggerModule.setup('api-json', app, document, {
      jsonDocumentUrl: 'api-json',
      yamlDocumentUrl: 'api-yaml',
    });
    
    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    
    // Add some debugging for the docs route
    if (req.url === '/docs' || req.url === '/docs/') {
      console.log('Docs route accessed:', req.url);
    }
    
    return app.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}