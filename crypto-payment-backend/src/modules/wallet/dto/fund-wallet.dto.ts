import { IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FundingMethod } from '../wallet-funding.service';

export class FundWalletDto {
  @ApiProperty({
    description: 'Amount to fund (USD)',
    example: 100,
    minimum: 1,
    maximum: 10000
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  amount: number;

  @ApiProperty({
    description: 'Funding method',
    enum: FundingMethod,
    example: FundingMethod.DEBIT_CARD
  })
  @IsEnum(FundingMethod)
  method: FundingMethod;

  @ApiProperty({
    description: 'Additional metadata for the funding method',
    required: false,
    example: { cardLast4: '1234' }
  })
  @IsOptional()
  metadata?: any;
}