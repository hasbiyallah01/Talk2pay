import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { AuthModule } from '../auth/auth.module';
import { TransactionModule } from '../transaction/transaction.module';
import { MerchantEntity } from '../../entities/merchant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MerchantEntity]),
    forwardRef(() => AuthModule), 
    forwardRef(() => TransactionModule)
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}