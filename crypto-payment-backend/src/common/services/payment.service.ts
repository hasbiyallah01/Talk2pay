import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async addPayment(payment: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const newPayment = this.paymentRepository.create(payment);
    const savedPayment = await this.paymentRepository.save(newPayment);
    this.logger.log(`Payment added: ${savedPayment.id} for merchant ${savedPayment.merchantId}`);
    return savedPayment;
  }

  async getPayment(paymentId: string): Promise<PaymentEntity | null> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    this.logger.debug(`Payment lookup for ${paymentId}: ${payment ? 'FOUND' : 'NOT FOUND'}`);
    return payment;
  }

  async updatePayment(paymentId: string, updates: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const payment = await this.getPayment(paymentId);
    if (!payment) {
      this.logger.warn(`Attempted to update non-existent payment: ${paymentId}`);
      throw new NotFoundException('Payment not found');
    }

    Object.assign(payment, updates);
    const updatedPayment = await this.paymentRepository.save(payment);
    this.logger.log(`Payment updated: ${paymentId} - status: ${updatedPayment.status}`);
    return updatedPayment;
  }

  async getAllPayments(): Promise<PaymentEntity[]> {
    const payments = await this.paymentRepository.find();
    this.logger.debug(`Retrieved ${payments.length} payments from database`);
    return payments;
  }

  async clearAll(): Promise<void> {
    const result = await this.paymentRepository.delete({});
    this.logger.log(`Cleared ${result.affected || 0} payments from database`);
  }
}