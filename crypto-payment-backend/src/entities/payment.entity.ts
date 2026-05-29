import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { MerchantEntity } from './merchant.entity';

@Entity('payments')
export class PaymentEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  merchantId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
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
}
