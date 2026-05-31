import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CryptoType } from '../common/enums/crypto-type.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { MerchantEntity } from './merchant.entity';
import { PaymentEntity } from './payment.entity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  paymentId: string;

  @Column()
  merchantId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: CryptoType
  })
  cryptoType: CryptoType;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  recipientAddress?: string;

  @Column({ nullable: true })
  senderAddress?: string;

  @Column({ type: 'varchar', default: 'debit', nullable: true })
  type?: string; // 'debit' = money sent out, 'credit' = money received

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @ManyToOne(() => MerchantEntity)
  @JoinColumn({ name: 'merchantId' })
  merchant: MerchantEntity;

  @ManyToOne(() => PaymentEntity)
  @JoinColumn({ name: 'paymentId' })
  payment: PaymentEntity;
}