import { Injectable, Logger } from '@nestjs/common';
import { CryptoType } from '../enums/crypto-type.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface Transaction {
  id: string;
  paymentId: string;
  merchantId: string;
  amount: number;
  cryptoType: CryptoType;
  description?: string;
  status: PaymentStatus;
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class TransactionRegistryService {
  private static readonly logger = new Logger(TransactionRegistryService.name);
  private static transactions: Map<string, Transaction> = new Map();

  static addTransaction(transaction: Transaction): void {
    this.transactions.set(transaction.id, transaction);
    this.logger.log(`Transaction added: ${transaction.id} for payment ${transaction.paymentId} - status: ${transaction.status}`);
    this.logger.debug(`Total transactions in registry: ${this.transactions.size}`);
  }

  static getTransaction(transactionId: string): Transaction | undefined {
    const transaction = this.transactions.get(transactionId);
    this.logger.debug(`Transaction lookup for ${transactionId}: ${transaction ? 'FOUND' : 'NOT FOUND'}`);
    return transaction;
  }

  static getTransactionByPaymentId(paymentId: string): Transaction | undefined {
    const transaction = Array.from(this.transactions.values()).find(t => t.paymentId === paymentId);
    this.logger.debug(`Transaction lookup by payment ID ${paymentId}: ${transaction ? 'FOUND' : 'NOT FOUND'}`);
    return transaction;
  }

  static updateTransaction(transactionId: string, updates: Partial<Transaction>): Transaction | undefined {
    const transaction = this.transactions.get(transactionId);
    if (transaction) {
      const updatedTransaction = { ...transaction, ...updates };
      this.transactions.set(transactionId, updatedTransaction);
      this.logger.log(`Transaction updated: ${transactionId} - status: ${updatedTransaction.status}`);
      return updatedTransaction;
    }
    this.logger.warn(`Attempted to update non-existent transaction: ${transactionId}`);
    return undefined;
  }

  static updateTransactionByPaymentId(paymentId: string, updates: Partial<Transaction>): Transaction | undefined {
    const transaction = this.getTransactionByPaymentId(paymentId);
    if (transaction) {
      return this.updateTransaction(transaction.id, updates);
    }
    this.logger.warn(`Attempted to update transaction for non-existent payment: ${paymentId}`);
    return undefined;
  }

  static getAllTransactions(): Transaction[] {
    const transactions = Array.from(this.transactions.values());
    this.logger.debug(`Retrieved ${transactions.length} transactions from registry`);
    return transactions;
  }

  static getTransactionsByMerchant(merchantId: string): Transaction[] {
    const transactions = Array.from(this.transactions.values()).filter(t => t.merchantId === merchantId);
    this.logger.debug(`Retrieved ${transactions.length} transactions for merchant ${merchantId}`);
    return transactions;
  }

  static clearAll(): void {
    const count = this.transactions.size;
    this.transactions.clear();
    this.logger.log(`Cleared ${count} transactions from registry`);
  }

  static generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}