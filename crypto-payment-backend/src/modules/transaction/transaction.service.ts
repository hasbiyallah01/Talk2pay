import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CryptoType } from '../../common/enums/crypto-type.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { TransactionHistoryQueryDto } from './dto/transaction-history-query.dto';
import { PaymentService } from '../../common/services/payment.service';
import { TransactionService as TransactionRepositoryService } from '../../common/services/transaction.service';
import { TransactionEntity } from '../../entities/transaction.entity';
import { PaymentEntity } from '../../entities/payment.entity';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly transactionRepositoryService: TransactionRepositoryService,
  ) {}

  // Complete a payment and record the transaction
  async completePayment(
    paymentId: string,
    cryptoType: CryptoType,
    shouldFail: boolean = false,
  ): Promise<TransactionEntity> {
    this.logger.log(`Attempting to complete payment: ${paymentId}`);
    
    // Find the payment using PaymentService
    const payment = await this.paymentService.getPayment(paymentId);
    if (!payment) {
      this.logger.error(`Payment not found: ${paymentId}`);
      throw new NotFoundException('Payment not found');
    }

    this.logger.log(`Found payment: ${paymentId} for merchant: ${payment.merchantId}`);

    // Simulate payment processing
    const status = shouldFail ? PaymentStatus.FAILED : PaymentStatus.COMPLETED;
    
    // Update payment status using PaymentService
    await this.paymentService.updatePayment(paymentId, {
      status,
      completedAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
    });

    // Update the existing transaction status
    const updatedTransaction = await this.transactionRepositoryService.updateTransactionByPaymentId(paymentId, {
      status,
      cryptoType,
      completedAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
    });

    return updatedTransaction;
  }

  // Record a transaction manually
  async recordTransaction(
    paymentId: string,
    merchantId: string,
    amount: number,
    cryptoType: CryptoType,
    description?: string,
    status: PaymentStatus = PaymentStatus.PENDING,
  ): Promise<TransactionEntity> {
    const now = new Date();
    
    const transaction = {
      id: this.transactionRepositoryService.generateTransactionId(),
      paymentId,
      merchantId,
      amount,
      cryptoType,
      description,
      status,
      createdAt: now,
      completedAt: status === PaymentStatus.COMPLETED ? now : undefined,
    };

    return await this.transactionRepositoryService.addTransaction(transaction);
  }

  // Update transaction status
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentStatus,
  ): Promise<TransactionEntity> {
    return await this.transactionRepositoryService.updateTransaction(transactionId, {
      status,
      completedAt: status === PaymentStatus.COMPLETED ? new Date() : undefined,
    });
  }

  // Get payment status by payment ID
  async getPaymentStatus(paymentId: string): Promise<{ 
    paymentId: string;
    status: PaymentStatus; 
    createdAt: Date;
    completedAt?: Date;
  }> {
    // Get payment from PaymentService
    const payment = await this.paymentService.getPayment(paymentId);
    
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    
    return {
      paymentId: payment.id,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    };
  }

  // Get transaction history witAt,tering and pagination
  async getTransactionHistory(
    merchantId: string,
    query: TransactionHistoryQueryDto,
  ): Promise<{
    transactions: TransactionEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.debug(`Getting transaction history for merchant: ${merchantId}`);
    
    // Get all transactions for the merchant from database
    let filteredTransactions = await this.transactionRepositoryService.getTransactionsByMerchant(merchantId);

    this.logger.debug(`Transactions for merchant ${merchantId}: ${filteredTransactions.length}`);

    // Apply date filtering with validation
    if (query.startDate) {
      const startDate = new Date(query.startDate);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date format');
      }
      filteredTransactions = filteredTransactions.filter(
        t => t.createdAt >= startDate,
      );
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date format');
      }
      filteredTransactions = filteredTransactions.filter(
        t => t.createdAt <= endDate,
      );
    }

    // Validate date range
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      if (startDate > endDate) {
        throw new Error('Start date cannot be after end date');
      }
    }

    // Sort by creation date (newest first)
    filteredTransactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filteredTransactions.length;
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100); // Cap at 100
    const totalPages = Math.ceil(total / limit);

    // Validate pagination
    if (page > totalPages && totalPages > 0) {
      throw new Error(`Page ${page} does not exist. Total pages: ${totalPages}`);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    this.logger.debug(`Returning ${paginatedTransactions.length} transactions (page ${page}/${totalPages})`);

    return {
      transactions: paginatedTransactions,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Get all transactions for export (with date filtering)
  async getTransactionsForExport(
    merchantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<TransactionEntity[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return await this.transactionRepositoryService.getTransactionsForExport(merchantId, start, end);
  }
}