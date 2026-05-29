import { Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface Payment {
  id: string;
  merchantId: string;
  amount: number;
  description?: string;
  status: PaymentStatus;
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class PaymentRegistryService {
  private static readonly logger = new Logger(PaymentRegistryService.name);
  private static payments: Map<string, Payment> = new Map();

  static addPayment(payment: Payment): void {
    this.payments.set(payment.id, payment);
    this.logger.log(`Payment added: ${payment.id} for merchant ${payment.merchantId}`);
    this.logger.debug(`Total payments in registry: ${this.payments.size}`);
  }

  static getPayment(paymentId: string): Payment | undefined {
    const payment = this.payments.get(paymentId);
    this.logger.debug(`Payment lookup for ${paymentId}: ${payment ? 'FOUND' : 'NOT FOUND'}`);
    if (!payment) {
      this.logger.debug(`Available payment IDs: ${Array.from(this.payments.keys()).join(', ')}`);
    }
    return payment;
  }

  static updatePayment(paymentId: string, updates: Partial<Payment>): Payment | undefined {
    const payment = this.payments.get(paymentId);
    if (payment) {
      const updatedPayment = { ...payment, ...updates };
      this.payments.set(paymentId, updatedPayment);
      this.logger.log(`Payment updated: ${paymentId} - status: ${updatedPayment.status}`);
      return updatedPayment;
    }
    this.logger.warn(`Attempted to update non-existent payment: ${paymentId}`);
    return undefined;
  }

  static getAllPayments(): Payment[] {
    const payments = Array.from(this.payments.values());
    this.logger.debug(`Retrieved ${payments.length} payments from registry`);
    return payments;
  }

  static clearAll(): void {
    const count = this.payments.size;
    this.payments.clear();
    this.logger.log(`Cleared ${count} payments from registry`);
  }
}