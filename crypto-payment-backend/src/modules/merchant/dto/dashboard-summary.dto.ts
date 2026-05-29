import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from '../../transaction/dto/transaction.dto';

export class DashboardSummaryDto {
  // Total number of successful payments
  @ApiProperty({
    description: 'Total number of successful payments',
    example: 25
  })
  totalPayments: number;

  // Total amount from successful payments
  @ApiProperty({
    description: 'Total amount from successful payments',
    example: 1250.50
  })
  totalAmount: number;

  // Recent transactions (last 10, all statuses)
  @ApiProperty({
    description: 'Recent transactions (last 10, all statuses)',
    type: [TransactionDto],
    isArray: true
  })
  recentTransactions: TransactionDto[];

  // Total number of all transactions (including pending/failed)
  @ApiProperty({
    description: 'Total number of all transactions (including pending/failed)',
    example: 30
  })
  totalTransactions: number;
}