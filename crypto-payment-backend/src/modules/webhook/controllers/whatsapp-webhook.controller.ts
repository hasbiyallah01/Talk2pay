import { Controller, Post, Body, Logger, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WhatsAppWebhookDto } from '../dto/whatsapp-webhook.dto';
import { MessagingService } from '../../messaging/messaging.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly messagingService: MessagingService,
  ) {}

  @Post('whatsapp')
  @ApiOperation({ summary: 'Handle WhatsApp webhook from Twilio' })
  @ApiResponse({ 
    status: 200, 
    description: 'TwiML response for WhatsApp message',
    schema: {
      type: 'string',
      example: '<Response><Message>Payment Created\nAmount: 50\nLink: https://pay.demo/uuid</Message></Response>'
    }
  })
  async handleWhatsAppWebhook(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
    webhookDto: WhatsAppWebhookDto,
  ): Promise<string> {
    this.logger.log(`Received WhatsApp message from ${webhookDto.From}: ${webhookDto.Body}`);

    try {
      // Extract phone number (remove whatsapp: prefix if present)
      const phoneNumber = webhookDto.From.replace(/^whatsapp:/, '');
      
      this.logger.log(`Processing command "${webhookDto.Body}" for phone number: ${phoneNumber}`);
      
      // Use the messaging service to handle the command
      const response = await this.messagingService.handleWhatsAppMessage(phoneNumber, webhookDto.Body);
      
      this.logger.log(`Response generated: ${JSON.stringify(response)}`);
      
      // Format the response as TwiML
      const twimlResponse = this.formatTwiMLResponse(response.message);
      this.logger.log(`TwiML response: ${twimlResponse}`);
      
      return twimlResponse;
      
    } catch (error) {
      this.logger.error(`Error processing WhatsApp webhook: ${error.message}`, error.stack);
      return this.formatTwiMLResponse('Sorry, there was an error processing your request. Please try again or contact support at +234-800-CRYPTO.');
    }
  }

  // Format message as TwiML response for WhatsApp
  private formatTwiMLResponse(message: string): string {
    // Escape XML special characters
    const escapedMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return `<Response><Message>${escapedMessage}</Message></Response>`;
  }
}