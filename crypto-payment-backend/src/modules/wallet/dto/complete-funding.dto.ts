import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteFundingDto {
  @ApiProperty({
    description: 'Transaction ID from funding initiation',
    example: 'fund_1234567890_abc123'
  })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    description: 'Amount that was funded',
    example: 100,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  amount: number;
}