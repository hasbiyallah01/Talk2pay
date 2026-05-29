import { CryptoType } from '../enums/crypto-type.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class TransactionResponseDto {
  id: string;
  paymentId: string;
  amount: number;
  cryptoType: CryptoType;
  description?: string;
  status: PaymentStatus;
  createdAt: Date;
  completedAt?: Date;
}

export class TransactionHistoryResponseDto {
  transactions: TransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
