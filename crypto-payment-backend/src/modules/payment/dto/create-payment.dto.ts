import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment amount (must be positive)',
    example: 50.00,
    minimum: 0.01
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Optional payment description',
    example: 'Coffee and pastry'
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
