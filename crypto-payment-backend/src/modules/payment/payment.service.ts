import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { CryptoType } from '../../common/enums/crypto-type.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SendCryptoDto } from './dto/send-crypto.dto';
import { PaymentService as PaymentRepositoryService } from '../../common/services/payment.service';
import { TransactionService as TransactionRepositoryService } from '../../common/services/transaction.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { TransactionEntity } from '../../entities/transaction.entity';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepositoryService: PaymentRepositoryService,
    private readonly transactionRepositoryService: TransactionRepositoryService,
  ) {}

  // Create a new payment request
  async createPaymentRequest(
    merchantId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentEntity> {
    const paymentId = this.generateUniquePaymentId();

    const payment = {
      id: paymentId,
      merchantId,
      amount: createPaymentDto.amount,
      description: createPaymentDto.description,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
    };

    // Add payment to database
    const savedPayment = await this.paymentRepositoryService.addPayment(payment);

    // Create corresponding transaction record
    const transaction = {
      id: this.transactionRepositoryService.generateTransactionId(),
      paymentId: savedPayment.id,
      merchantId: savedPayment.merchantId,
      amount: savedPayment.amount,
      cryptoType: CryptoType.BITCOIN, // Default to bitcoin, will be updated when payment is completed
      description: savedPayment.description,
      status: PaymentStatus.PENDING,
      createdAt: savedPayment.createdAt,
    };

    await this.transactionRepositoryService.addTransaction(transaction);

    return savedPayment;
  }

  // Create a send transaction for merchant crypto transfers
  async sendCrypto(
    merchantId: string,
    sendCryptoDto: SendCryptoDto,
  ): Promise<{ payment: PaymentEntity; transaction: TransactionEntity }> {
    const paymentId = this.generateUniquePaymentId();
    const completedAt = new Date();
    const cryptoType = sendCryptoDto.cryptoType ?? CryptoType.BITCOIN;

    const payment = {
      id: paymentId,
      merchantId,
      amount: sendCryptoDto.amount,
      description: sendCryptoDto.description
        ? `Send to ${sendCryptoDto.recipientAddress}: ${sendCryptoDto.description}`
        : `Send to ${sendCryptoDto.recipientAddress}`,
      status: PaymentStatus.COMPLETED,
      createdAt: completedAt,
      completedAt,
    };

    const savedPayment = await this.paymentRepositoryService.addPayment(payment);

    const transaction = {
      id: this.transactionRepositoryService.generateTransactionId(),
      paymentId: savedPayment.id,
      merchantId: savedPayment.merchantId,
      amount: savedPayment.amount,
      cryptoType,
      recipientAddress: sendCryptoDto.recipientAddress,
      description: sendCryptoDto.description,
      status: PaymentStatus.COMPLETED,
      createdAt: savedPayment.createdAt,
      completedAt: savedPayment.completedAt,
    };

    const savedTransaction = await this.transactionRepositoryService.addTransaction(transaction);
    return { payment: savedPayment, transaction: savedTransaction };
  }

  // Retrieve payment details by payment ID
  async getPaymentDetails(paymentId: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepositoryService.getPayment(paymentId);

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  // Generate a unique payment ID using UUID v4
  private generateUniquePaymentId(): string {
    return randomUUID();
  }

  // Get all payments for a specific merchant (for testing purposes)
  async getPaymentsByMerchant(merchantId: string): Promise<PaymentEntity[]> {
    const allPayments = await this.paymentRepositoryService.getAllPayments();
    return allPayments.filter((payment) => payment.merchantId === merchantId);
  }

  // Update payment status (will be used by transaction module)
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    completedAt?: Date,
  ): Promise<PaymentEntity> {
    return await this.paymentRepositoryService.updatePayment(paymentId, {
      status,
      completedAt,
    });
  }

  // Generate payment link URL for a payment request
  generatePaymentLink(
    paymentId: string,
    baseUrl: string = 'http://localhost:3000',
  ): string {
    return `${baseUrl}/payment/${paymentId}`;
  }

  // Generate QR code data for a payment request
  async generateQRCode(paymentId: string, baseUrl?: string): Promise<string> {
    // Verify payment exists
    await this.getPaymentDetails(paymentId);

    const paymentLink = this.generatePaymentLink(paymentId, baseUrl);

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(paymentLink, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }
}