import { Controller, Post, Body, Logger } from '@nestjs/common';
import { USSDWebhookDto } from '../dto/ussd-webhook.dto';
import { PaymentService } from '../../payment/payment.service';
import { CreatePaymentDto } from '../../payment/dto/create-payment.dto';

@Controller('webhooks')
export class USSDWebhookController {
  private readonly logger = new Logger(USSDWebhookController.name);
  private readonly defaultMerchantId = 'webhook-system';
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  constructor(private readonly paymentService: PaymentService) {}

  @Post('ussd')
  async handleUSSDWebhook(@Body() webhookDto: USSDWebhookDto): Promise<string> {
    try {
      this.logger.log(`USSD webhook received from ${webhookDto.phoneNumber}, text: "${webhookDto.text}"`);
      
      const userInput = webhookDto.text.trim();
      
      // Handle different USSD flow states based on user input
      if (userInput === '') {
        // Initial request - show main menu
        return this.formatUSSDContinue(this.getMainMenu());
      }
      
      if (userInput === '1') {
        // User selected "Create Payment" - prompt for amount
        return this.formatUSSDContinue(this.getAmountPrompt());
      }
      
      if (userInput === '2') {
        // User selected "Exit" - terminate session
        return this.formatUSSDEnd('Thank you for using our payment service. Goodbye!');
      }
      
      if (userInput.startsWith('1*')) {
        // User entered amount after selecting create payment
        return await this.handlePaymentCreation(userInput, webhookDto.phoneNumber);
      }
      
      // Invalid input - show help and return to main menu
      return this.formatUSSDContinue(this.getInvalidInputMessage());
      
    } catch (error) {
      this.logger.error(`Error processing USSD webhook: ${error.message}`, error.stack);
      return this.formatUSSDEnd('Payment creation failed. Please try again later.');
    }
  }

  // Handle payment creation when user provides amount
  private async handlePaymentCreation(userInput: string, phoneNumber: string): Promise<string> {
    try {
      // Extract amount from input (format: "1*<amount>")
      const inputParts = userInput.split('*');
      if (inputParts.length !== 2) {
        return this.formatUSSDContinue(this.getInvalidAmountMessage());
      }
      
      const amountStr = inputParts[1];
      const amount = parseFloat(amountStr);
      
      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        return this.formatUSSDContinue(this.getInvalidAmountMessage());
      }
      
      // Create payment request
      const createPaymentDto: CreatePaymentDto = {
        amount: amount,
        description: `USSD Payment from ${phoneNumber}`
      };
      
      const payment = await this.paymentService.createPaymentRequest(
        this.defaultMerchantId,
        createPaymentDto
      );
      
      // Generate payment link
      const paymentLink = this.paymentService.generatePaymentLink(payment.id, this.baseUrl);
      
      // Return success message with payment details
      return this.formatUSSDEnd(this.getPaymentSuccessMessage(amount, paymentLink));
      
    } catch (error) {
      this.logger.error(`Error creating payment: ${error.message}`, error.stack);
      return this.formatUSSDEnd('Payment creation failed. Please try again later.');
    }
  }

  // Format USSD response to continue session
  private formatUSSDContinue(message: string): string {
    return `CON ${message}`;
  }

  // Format USSD response to end session
  private formatUSSDEnd(message: string): string {
    return `END ${message}`;
  }

  // Get main menu text
  private getMainMenu(): string {
    return 'Welcome to Payment Service\n1. Create Payment\n2. Exit';
  }

  // Get amount prompt text
  private getAmountPrompt(): string {
    return 'Enter payment amount:\n(e.g., 50 for ₿50)';
  }

  // Get invalid input message
  private getInvalidInputMessage(): string {
    return 'Invalid option. Please try again.\n1. Create Payment\n2. Exit';
  }

  // Get invalid amount message
  private getInvalidAmountMessage(): string {
    return 'Invalid amount. Please enter a valid number:\n(e.g., 50 for ₿50)';
  }

  // Get payment success message
  private getPaymentSuccessMessage(amount: number, paymentLink: string): string {
    return `Payment Created Successfully!\nAmount: ₿${amount.toFixed(2)}\nLink: ${paymentLink}`;
  }
}