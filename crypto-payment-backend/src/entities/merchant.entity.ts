import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CryptoType } from '../common/enums/crypto-type.enum';

@Entity('merchants')
export class MerchantEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  phoneNumber: string | null;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  walletPin: string; // Encrypted 4-6 digit PIN for WhatsApp transactions

  @Column('decimal', { precision: 18, scale: 8, default: 0 })
  walletBalance: number;

  @Column('simple-array')
  cryptoPreferences: CryptoType[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}