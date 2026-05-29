import { ApiProperty } from '@nestjs/swagger';
import { TransactionDto } from './transaction.dto';

export class TransactionHistoryResponseDto {
  @ApiProperty({
    description: 'Array of transactions',
    type: [TransactionDto],
    isArray: true
  })
  transactions: TransactionDto[];

  @ApiProperty({
    description: 'Total number of transactions',
    example: 50
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5
  })
  totalPages: number;

  constructor(data: {
    transactions: TransactionDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }) {
    this.transactions = data.transactions;
    this.total = data.total;
    this.page = data.page;
    this.limit = data.limit;
    this.totalPages = data.totalPages;
  }
}