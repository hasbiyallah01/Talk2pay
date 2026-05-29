import { Injectable, BadRequestException } from '@nestjs/common';
import { TransactionEntity } from '../../entities/transaction.entity';

@Injectable()
export class CsvExportService {
  // Generate CSV content from transaction data
  generateTransactionsCsv(transactions: TransactionEntity[]): string {
    // Define CSV headers
    const headers = ['Date', 'Amount', 'Crypto Type', 'Description', 'Status'];
    
    // Start with headers
    const csvRows = [headers.join(',')];

    // Add transaction data rows
    transactions.forEach(transaction => {
      const row = [
        this.formatDate(transaction.createdAt),
        transaction.amount.toString(),
        transaction.cryptoType,
        this.escapeCsvField(transaction.description || ''),
        transaction.status,
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // Validate date range for export
  validateDateRange(startDate?: string, endDate?: string): void {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
      
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
      
      if (start > end) {
        throw new BadRequestException('Start date cannot be after end date');
      }
    } else if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid start date format');
      }
    } else if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid end date format');
      }
    }
  }

  // Generate filename for CSV export
  generateFilename(merchantId: string, startDate?: string, endDate?: string): string {
    const today = new Date().toISOString().split('T')[0];
    let filename = `transactions_${merchantId}`;
    
    if (startDate && endDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      const end = new Date(endDate).toISOString().split('T')[0];
      filename += `_${start}_to_${end}`;
    } else if (startDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      filename += `_from_${start}`;
    } else if (endDate) {
      const end = new Date(endDate).toISOString().split('T')[0];
      filename += `_until_${end}`;
    } else {
      filename += `_${today}`;
    }
    
    return `${filename}.csv`;
  }

  // Format date for CSV output
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Escape CSV field to handle commas, quotes, and newlines
  private escapeCsvField(field: string): string {
    if (!field) return '';
    
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    
    return field;
  }
}