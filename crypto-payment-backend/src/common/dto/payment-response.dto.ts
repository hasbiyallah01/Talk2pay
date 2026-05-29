import { PaymentStatus } from '../enums/payment-status.enum';

export class PaymentResponseDto {
  id: string;
  amount: number;
  description?: string;
  status: PaymentStatus;
  createdAt: Date;
  completedAt?: Date;
}

export class PaymentDetailsResponseDto extends PaymentResponseDto {
  merchantBusinessName: string;
}
