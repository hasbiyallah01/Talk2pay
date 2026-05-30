import { Module } from '@nestjs/common';
import { WhatsAppWebhookController } from './controllers/whatsapp-webhook.controller';
import { USSDWebhookController } from './controllers/ussd-webhook.controller';
import { PaymentModule } from '../payment/payment.module';
import { MerchantModule } from '../merchant/merchant.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [PaymentModule, MerchantModule, MessagingModule],
  controllers: [WhatsAppWebhookController, USSDWebhookController],
  providers: [],
})
export class WebhookModule {}