import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletFundingService } from './wallet-funding.service';
import { MessagingModule } from '../messaging/messaging.module';
import { AuthModule } from '../auth/auth.module';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [MessagingModule, AuthModule, MerchantModule],
  controllers: [WalletController],
  providers: [WalletFundingService],
  exports: [WalletFundingService],
})
export class WalletModule {}