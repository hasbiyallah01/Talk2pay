import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SendCryptoDto } from './dto/send-crypto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Create a new payment request
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create payment request',
    description: 'Creates a new payment request with amount and optional description'
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({
    status: 201,
    description: 'Payment request created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-payment-id' },
        merchantId: { type: 'string', example: 'uuid-merchant-id' },
        amount: { type: 'number', example: 50.00 },
        description: { type: 'string', example: 'Coffee and pastry' },
        status: { type: 'string', example: 'pending' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid payment data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async createPayment(
    @Request() req: AuthenticatedRequest,
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto,
  ): Promise<{
    id: string;
    merchantId: string;
    amount: number;
    description?: string;
    status: string;
    createdAt: Date;
  }> {
    const payment = await this.paymentService.createPaymentRequest(
      req.user.merchantId,
      createPaymentDto,
    );

    return {
      id: payment.id,
      merchantId: payment.merchantId,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      createdAt: payment.createdAt,
    };
  }

  // Send crypto from merchant wallet
  @Post('send')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Send crypto',
    description: 'Creates a send transaction to transfer crypto from the merchant account to a recipient address'
  })
  @ApiBody({ type: SendCryptoDto })
  @ApiResponse({
    status: 201,
    description: 'Crypto send transaction created successfully',
    schema: {
      type: 'object',
      properties: {
        transactionId: { type: 'string', example: 'txn_123abc' },
        paymentId: { type: 'string', example: 'uuid-payment-id' },
        merchantId: { type: 'string', example: 'uuid-merchant-id' },
        amount: { type: 'number', example: 0.5 },
        cryptoType: { type: 'string', example: 'bitcoin' },
        recipientAddress: { type: 'string', example: 'bc1qrecipientaddress...' },
        description: { type: 'string', example: 'Rent payment' },
        status: { type: 'string', example: 'completed' },
        createdAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' },
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid send data' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async sendCrypto(
    @Request() req: AuthenticatedRequest,
    @Body(ValidationPipe) sendCryptoDto: SendCryptoDto,
  ): Promise<{
    transactionId: string;
    paymentId: string;
    merchantId: string;
    amount: number;
    cryptoType: string;
    recipientAddress: string;
    description?: string;
    status: string;
    createdAt: Date;
    completedAt: Date;
  }> {
    const result = await this.paymentService.sendCrypto(req.user.merchantId, sendCryptoDto);

    return {
      transactionId: result.transaction.id,
      paymentId: result.payment.id,
      merchantId: result.payment.merchantId,
      amount: result.transaction.amount,
      cryptoType: result.transaction.cryptoType,
      recipientAddress: result.transaction.recipientAddress!,
      description: result.transaction.description,
      status: result.transaction.status,
      createdAt: result.transaction.createdAt,
      completedAt: result.transaction.completedAt!,
    };
  }

  // Get payment details by payment ID
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get payment details',
    description: 'Retrieves payment details for customers (public endpoint)'
  })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 'uuid-payment-id' })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-payment-id' },
        amount: { type: 'number', example: 50.00 },
        description: { type: 'string', example: 'Coffee and pastry' },
        status: { type: 'string', example: 'pending' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async getPaymentDetails(@Param('id') paymentId: string): Promise<{
    id: string;
    amount: number;
    description?: string;
    status: string;
    createdAt: Date;
  }> {
    const payment = await this.paymentService.getPaymentDetails(paymentId);

    // Return only customer-relevant information, hide merchant ID
    return {
      id: payment.id,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      createdAt: payment.createdAt,
    };
  }

  // Generate QR code for payment
  @Get(':id/qr')
  @ApiOperation({ 
    summary: 'Generate QR code',
    description: 'Generates QR code and payment link for a payment request'
  })
  @ApiParam({ name: 'id', description: 'Payment ID', example: 'uuid-payment-id' })
  @ApiResponse({
    status: 200,
    description: 'QR code generated successfully',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', example: 'uuid-payment-id' },
        qrCodeData: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' },
        paymentLink: { type: 'string', example: 'https://api.example.com/payment/uuid-payment-id' }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async generateQRCode(@Param('id') paymentId: string): Promise<{
    paymentId: string;
    qrCodeData: string;
    paymentLink: string;
  }> {
    const qrCodeData = await this.paymentService.generateQRCode(paymentId);
    const paymentLink = this.paymentService.generatePaymentLink(paymentId);

    return {
      paymentId,
      qrCodeData,
      paymentLink,
    };
  }
}