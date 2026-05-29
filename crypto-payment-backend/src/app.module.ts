import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { PaymentModule } from './modules/payment/payment.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SecurityConfig } from './common/config/security.config';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { databaseConfig } from './common/config/database.config';

@Module({
  imports: [
    // Database configuration
    TypeOrmModule.forRoot(databaseConfig),
    // Rate limiting configuration
    ThrottlerModule.forRoot(SecurityConfig.rateLimit.global),
    AuthModule,
    MerchantModule,
    PaymentModule,
    TransactionModule,
    WebhookModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
