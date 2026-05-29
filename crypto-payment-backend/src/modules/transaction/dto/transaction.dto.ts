import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CryptoType } from '../../../common/enums/crypto-type.enum';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
export class TransactionDto {
    @ApiProperty({
      description: 'Transaction ID',
      example: 'uuid-transaction-id'
    })
    id: string;
  
    @ApiProperty({
      description: 'Payment ID',
      example: 'uuid-payment-id'
    })
    paymentId: string;
  
    @ApiProperty({
      description: 'Merchant ID',
      example: 'uuid-merchant-id'
    })
    merchantId: string;
  
    @ApiProperty({
      description: 'Transaction amount',
      example: 50.00
    })
    amount: number;
  
    @ApiProperty({
      description: 'Cryptocurrency type',
      enum: CryptoType,
      example: CryptoType.BITCOIN
    })
    cryptoType: CryptoType;
  
    @ApiPropertyOptional({
      description: 'Transaction description',
      example: 'Coffee and pastry'
    })
    description?: string;
  
    @ApiProperty({
      description: 'Transaction status',
      enum: PaymentStatus,
      example: PaymentStatus.COMPLETED
    })
    status: PaymentStatus;
  
    @ApiProperty({
      description: 'Transaction creation date',
      type: 'string',
      format: 'date-time'
    })
    createdAt: Date;
  
    @ApiPropertyOptional({
      description: 'Transaction completion date',
      type: 'string',
      format: 'date-time'
    })
    completedAt?: Date;
  }