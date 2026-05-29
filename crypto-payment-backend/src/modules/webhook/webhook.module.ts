import { Module } from '@nestjs/common';
import { WhatsAppWebhookController } from './controllers/whatsapp-webhook.controller';
import { USSDWebhookController } from './controllers/ussd-webhook.controller';
import { PaymentModule } from '../payment/payment.module';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [PaymentModule, MerchantModule],
  controllers: [WhatsAppWebhookController, USSDWebhookController],
  providers: [],
})
export class WebhookModule {}