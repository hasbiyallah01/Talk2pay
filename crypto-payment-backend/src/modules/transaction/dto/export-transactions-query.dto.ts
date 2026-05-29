import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExportTransactionsQueryDto {
  @ApiPropertyOptional({
    description: 'Start date filter for export (YYYY-MM-DD)',
    example: '2024-01-01',
    format: 'date'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date filter for export (YYYY-MM-DD)',
    example: '2024-12-31',
    format: 'date'
  })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;
}
