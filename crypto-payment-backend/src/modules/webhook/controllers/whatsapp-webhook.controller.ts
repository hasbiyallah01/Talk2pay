import { Controller, Post, Body, Logger, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WhatsAppWebhookDto } from '../dto/whatsapp-webhook.dto';
import { PaymentService } from '../../payment/payment.service';
import { MerchantService } from '../../merchant/merchant.service';
import { CreatePaymentDto } from '../../payment/dto/create-payment.dto';

interface ParsedCommand {
  command: string;
  amount?: number;
  description?: string;
  isValid: boolean;
  error?: string;
}

@ApiTags('Webhooks')
@Controller('webhooks')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly merchantService: MerchantService,
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
      const parsedCommand = this.parseCommand(webhookDto.Body.trim());

      if (!parsedCommand.isValid) {
        return this.formatHelpResponse(parsedCommand.error);
      }

      switch (parsedCommand.command) {
        case 'create':
          return await this.handleCreateCommand(parsedCommand, webhookDto.From);
        case 'help':
          return this.formatHelpResponse();
        default:
          return this.formatHelpResponse('Invalid command. Use "help" to see available commands.');
      }
    } catch (error) {
      return this.formatErrorResponse('Payment creation failed. Please try again.');
    }
  }

  // Parse user command from WhatsApp message
  private parseCommand(message: string): ParsedCommand {
    const parts = message.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'create':
        return this.parseCreateCommand(parts);
      case 'help':
        return { command: 'help', isValid: true };
      default:
        return { 
          command: 'unknown', 
          isValid: false, 
          error: `Unknown command: ${command}` 
        };
    }
  }

  // Parse create command with amount and optional description
  private parseCreateCommand(parts: string[]): ParsedCommand {
    if (parts.length < 2) {
      return {
        command: 'create',
        isValid: false,
        error: 'Create command requires an amount. Usage: create <amount> [description]'
      };
    }

    const amountStr = parts[1];
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      return {
        command: 'create',
        isValid: false,
        error: 'Amount must be a positive number. Usage: create <amount> [description]'
      };
    }

    const description = parts.length > 2 ? parts.slice(2).join(' ') : undefined;

    return {
      command: 'create',
      amount,
      description,
      isValid: true
    };
  }

  // Handle create payment command
  private async handleCreateCommand(parsedCommand: ParsedCommand, from: string): Promise<string> {
    const merchantId = await this.resolveMerchantId(from);
    if (!merchantId) {
      return this.formatErrorResponse(
        'Your phone number is not registered. Please create an account to continue.',
      );
    }

    const createPaymentDto: CreatePaymentDto = {
      amount: parsedCommand.amount!,
      description: parsedCommand.description,
    };

    const payment = await this.paymentService.createPaymentRequest(
      merchantId,
      createPaymentDto,
    );

    const paymentLink = this.paymentService.generatePaymentLink(payment.id);

    const message = `Payment Created\nAmount: ${payment.amount}\nDescription: ${payment.description || 'N/A'}\nLink: ${paymentLink}`;
    
    this.logger.log(`Created payment ${payment.id} for amount ${payment.amount}`);
    
    return this.formatTwiMLResponse(message);
  }

  private async resolveMerchantId(from: string): Promise<string | null> {
    const normalizedPhone = from.replace(/^whatsapp:/, '');
    const merchant = await this.merchantService.findByPhoneNumber(normalizedPhone);

    if (merchant) {
      this.logger.log(`Resolved WhatsApp sender to merchant ${merchant.id}`);
      return merchant.id;
    }

    this.logger.warn(`No merchant found for WhatsApp sender ${normalizedPhone}`);
    return null;
  }

  // Format help response with available commands
  private formatHelpResponse(error?: string): string {
    let message = '';
    
    if (error) {
      message += `Error: ${error}\n\n`;
    }
    
    message += 'Available Commands:\n';
    message += '• create <amount> [description] - Create a payment request\n';
    message += '• help - Show this help message\n\n';
    message += 'Example: create 50 Coffee payment';

    return this.formatTwiMLResponse(message);
  }

  // Format error response
  private formatErrorResponse(errorMessage: string): string {
    const message = `${errorMessage}\n\nSend "help" for available commands.`;
    return this.formatTwiMLResponse(message);
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