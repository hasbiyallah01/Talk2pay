import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { WhatsAppWalletService } from './whatsapp-wallet.service';
import { AuthModule } from '../auth/auth.module';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [AuthModule, MerchantModule],
  controllers: [MessagingController],
  providers: [MessagingService, WhatsAppWalletService],
  exports: [MessagingService, WhatsAppWalletService],
})
export class MessagingModule {}