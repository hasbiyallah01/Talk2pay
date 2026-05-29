import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { CsvExportService } from './csv-export.service';
import { AuthModule } from '../auth/auth.module';
import { TransactionEntity } from '../../entities/transaction.entity';
import { PaymentEntity } from '../../entities/payment.entity';
import { TransactionService as TransactionRepositoryService } from '../../common/services/transaction.service';
import { PaymentService as PaymentRepositoryService } from '../../common/services/payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, PaymentEntity]),
    forwardRef(() => AuthModule)
  ],
  controllers: [TransactionController],
  providers: [TransactionService, CsvExportService, TransactionRepositoryService, PaymentRepositoryService],
  exports: [TransactionService, CsvExportService, TransactionRepositoryService, PaymentRepositoryService],
})
export class TransactionModule {}