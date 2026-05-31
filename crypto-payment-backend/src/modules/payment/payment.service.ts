import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { CryptoType } from '../../common/enums/crypto-type.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SendCryptoDto } from './dto/send-crypto.dto';
import { PaymentService as PaymentRepositoryService } from '../../common/services/payment.service';
import { TransactionService as TransactionRepositoryService } from '../../common/services/transaction.service';
import { PaymentEntity } from '../../entities/payment.entity';
import { TransactionEntity } from '../../entities/transaction.entity';
import { MerchantEntity } from '../../entities/merchant.entity';
import { randomUUID } from 'crypto';
import * as QRCode from 'qrcode';

// Helper: normalize phone number to +234 format
function normalizePhone(phone: string): string {
  const p = phone.trim();
  if (p.startsWith('0')) return '+234' + p.slice(1);
  if (p.startsWith('234') && !p.startsWith('+')) return '+' + p;
  return p;
}

function getPhoneFormats(phone: string): string[] {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return [phone];

  let local = '';
  let intNoPlus = '';
  let intWithPlus = '';

  if (digits.startsWith('0') && digits.length === 11) {
    local = digits;
    intNoPlus = '234' + digits.slice(1);
    intWithPlus = '+' + intNoPlus;
  } else if (digits.startsWith('234')) {
    intNoPlus = digits;
    intWithPlus = '+' + digits;
    local = '0' + digits.slice(3);
  } else {
    return [phone, digits, '+' + digits];
  }

  return Array.from(new Set([phone, digits, local, intNoPlus, intWithPlus]));
}

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepositoryService: PaymentRepositoryService,
    private readonly transactionRepositoryService: TransactionRepositoryService,
    @InjectRepository(MerchantEntity)
    private readonly merchantRepository: Repository<MerchantEntity>,
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
    // 1. Load sender merchant and validate balance
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const currentBalance = Number(merchant.walletBalance) || 0;
    if (currentBalance < sendCryptoDto.amount) {
      throw new BadRequestException(
        `Insufficient balance. You have ₦${currentBalance.toLocaleString()} but tried to send ₦${sendCryptoDto.amount.toLocaleString()}`,
      );
    }

    // 2. Debit sender wallet balance
    merchant.walletBalance = currentBalance - sendCryptoDto.amount;
    merchant.updatedAt = new Date();
    await this.merchantRepository.save(merchant);

    // 3. Try to find recipient as a registered user (by phone number)
    const recipientQuery = sendCryptoDto.recipientAddress?.trim() || '';
    const formats = getPhoneFormats(recipientQuery);
    const recipientMerchant = await this.merchantRepository.createQueryBuilder('merchant')
      .where('merchant.phoneNumber IN (:...formats)', { formats })
      .getOne();

    // 4. If recipient is a registered user, credit their wallet
    if (recipientMerchant && recipientMerchant.id !== merchantId) {
      recipientMerchant.walletBalance =
        Number(recipientMerchant.walletBalance || 0) + sendCryptoDto.amount;
      recipientMerchant.updatedAt = new Date();
      await this.merchantRepository.save(recipientMerchant);
    }

    // 5. Create payment and debit transaction records for sender
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

    // Sender's debit transaction
    const debitTransaction = {
      id: this.transactionRepositoryService.generateTransactionId(),
      paymentId: savedPayment.id,
      merchantId: savedPayment.merchantId,
      amount: sendCryptoDto.amount,
      cryptoType,
      recipientAddress: sendCryptoDto.recipientAddress,
      description: sendCryptoDto.description,
      status: PaymentStatus.COMPLETED,
      type: 'debit',
      createdAt: savedPayment.createdAt,
      completedAt: savedPayment.completedAt,
    };

    const savedTransaction = await this.transactionRepositoryService.addTransaction(debitTransaction);

    // 6. Create a credit transaction for the recipient (if registered user)
    if (recipientMerchant && recipientMerchant.id !== merchantId) {
      const creditPaymentId = this.generateUniquePaymentId();
      const creditPayment = {
        id: creditPaymentId,
        merchantId: recipientMerchant.id,
        amount: sendCryptoDto.amount,
        description: sendCryptoDto.description
          ? `Received from ${merchant.phoneNumber || merchant.firstName}: ${sendCryptoDto.description}`
          : `Received from ${merchant.phoneNumber || merchant.firstName}`,
        status: PaymentStatus.COMPLETED,
        createdAt: completedAt,
        completedAt,
      };
      const savedCreditPayment = await this.paymentRepositoryService.addPayment(creditPayment);

      const creditTransaction = {
        id: this.transactionRepositoryService.generateTransactionId(),
        paymentId: savedCreditPayment.id,
        merchantId: recipientMerchant.id,
        amount: sendCryptoDto.amount,
        cryptoType,
        senderAddress: merchant.phoneNumber || merchant.firstName || merchantId,
        description: sendCryptoDto.description,
        status: PaymentStatus.COMPLETED,
        type: 'credit',
        createdAt: completedAt,
        completedAt,
      };
      await this.transactionRepositoryService.addTransaction(creditTransaction);
    }

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