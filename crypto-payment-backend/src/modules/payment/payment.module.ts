import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { AuthModule } from '../auth/auth.module';
import { PaymentEntity } from '../../entities/payment.entity';
import { TransactionEntity } from '../../entities/transaction.entity';
import { MerchantEntity } from '../../entities/merchant.entity';
import { PaymentService as PaymentRepositoryService } from '../../common/services/payment.service';
import { TransactionService as TransactionRepositoryService } from '../../common/services/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, TransactionEntity, MerchantEntity]),
    AuthModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepositoryService, TransactionRepositoryService],
  exports: [PaymentService, PaymentRepositoryService],
})
export class PaymentModule {}