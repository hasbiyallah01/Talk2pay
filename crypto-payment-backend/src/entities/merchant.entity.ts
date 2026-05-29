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

  @Column()
  passwordHash: string;

  @Column()
  businessName: string;

  @Column('simple-array')
  cryptoPreferences: CryptoType[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}