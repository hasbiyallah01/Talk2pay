import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../../entities/transaction.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async addTransaction(transaction: Partial<TransactionEntity>): Promise<TransactionEntity> {
    const newTransaction = this.transactionRepository.create(transaction);
    const savedTransaction = await this.transactionRepository.save(newTransaction);
    this.logger.log(`Transaction added: ${savedTransaction.id} for payment ${savedTransaction.paymentId} - status: ${savedTransaction.status}`);
    return savedTransaction;
  }

  async getTransaction(transactionId: string): Promise<TransactionEntity | null> {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } });
    this.logger.debug(`Transaction lookup for ${transactionId}: ${transaction ? 'FOUND' : 'NOT FOUND'}`);
    return transaction;
  }

  async getTransactionByPaymentId(paymentId: string): Promise<TransactionEntity | null> {
    const transaction = await this.transactionRepository.findOne({ where: { paymentId } });
    this.logger.debug(`Transaction lookup by payment ID ${paymentId}: ${transaction ? 'FOUND' : 'NOT FOUND'}`);
    return transaction;
  }

  async updateTransaction(transactionId: string, updates: Partial<TransactionEntity>): Promise<TransactionEntity> {
    const transaction = await this.getTransaction(transactionId);
    if (!transaction) {
      this.logger.warn(`Attempted to update non-existent transaction: ${transactionId}`);
      throw new NotFoundException('Transaction not found');
    }

    Object.assign(transaction, updates);
    const updatedTransaction = await this.transactionRepository.save(transaction);
    this.logger.log(`Transaction updated: ${transactionId} - status: ${updatedTransaction.status}`);
    return updatedTransaction;
  }

  async updateTransactionByPaymentId(paymentId: string, updates: Partial<TransactionEntity>): Promise<TransactionEntity> {
    const transaction = await this.getTransactionByPaymentId(paymentId);
    if (!transaction) {
      this.logger.warn(`Attempted to update transaction for non-existent payment: ${paymentId}`);
      throw new NotFoundException('Transaction not found for payment');
    }

    return this.updateTransaction(transaction.id, updates);
  }

  async getAllTransactions(): Promise<TransactionEntity[]> {
    const transactions = await this.transactionRepository.find();
    this.logger.debug(`Retrieved ${transactions.length} transactions from database`);
    return transactions;
  }

  async getTransactionsByMerchant(merchantId: string): Promise<TransactionEntity[]> {
    const transactions = await this.transactionRepository.find({ where: { merchantId } });
    this.logger.debug(`Retrieved ${transactions.length} transactions for merchant ${merchantId}`);
    return transactions;
  }

  async getTransactionsForExport(
    merchantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionEntity[]> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.merchantId = :merchantId', { merchantId });

    if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    const transactions = await queryBuilder
      .orderBy('transaction.createdAt', 'ASC')
      .getMany();

    return transactions;
  }

  async clearAllTransactions(): Promise<void> {
    const result = await this.transactionRepository.delete({});
    this.logger.log(`Cleared ${result.affected || 0} transactions from database`);
  }

  generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}