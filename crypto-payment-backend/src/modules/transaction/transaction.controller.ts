import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  Body,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { TransactionService } from './transaction.service';
import { CsvExportService } from './csv-export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { CompletePaymentDto } from './dto/complete-payment.dto';
import { ExportTransactionsQueryDto } from './dto/export-transactions-query.dto';
import { TransactionHistoryQueryDto } from './dto/transaction-history-query.dto';
import { TransactionHistoryResponseDto } from './dto/transaction-history-response.dto';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionEntity } from '../../entities/transaction.entity';
import { CryptoType } from '../../common/enums/crypto-type.enum';

@ApiTags('transaction')
@ApiBearerAuth('JWT-auth')
@Controller('transaction')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly csvExportService: CsvExportService,
  ) {}

  // Convert TransactionEntity to TransactionDto
  private mapTransactionEntityToDto(entity: TransactionEntity): TransactionDto {
    return {
      id: entity.id,
      paymentId: entity.paymentId,
      merchantId: entity.merchantId,
      amount: entity.amount,
      cryptoType: entity.cryptoType,
      description: entity.description,
      status: entity.status,
      createdAt: entity.createdAt,
      completedAt: entity.completedAt,
    };
  }

  // Get transaction history with filtering and pagination
  @Get('history')
  @ApiOperation({ 
    summary: 'Get transaction history',
    description: 'Retrieves merchant transaction history with optional date filtering and pagination'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)', example: '2024-12-31' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: TransactionHistoryResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async getTransactionHistory(
    @Req() req: AuthenticatedRequest,
    @Query() query: TransactionHistoryQueryDto,
  ): Promise<TransactionHistoryResponseDto> {
    try {
      const result = await this.transactionService.getTransactionHistory(
        req.user.merchantId,
        query,
      );

      // Map entities to DTOs
      const mappedResult = {
        ...result,
        transactions: result.transactions.map(entity => this.mapTransactionEntityToDto(entity))
      };

      return new TransactionHistoryResponseDto(mappedResult);
    } catch (error) {
      if (error.message.includes('Invalid') || error.message.includes('does not exist')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // Export transactions as CSV
  @Get('export')
  @ApiOperation({ 
    summary: 'Export transactions as CSV',
    description: 'Exports merchant transactions as CSV file with optional date filtering'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)', example: '2024-12-31' })
  @ApiResponse({
    status: 200,
    description: 'CSV file generated and downloaded successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid date parameters' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async exportTransactions(
    @Req() req: AuthenticatedRequest,
    @Query() query: ExportTransactionsQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Validate date range
      this.csvExportService.validateDateRange(query.startDate, query.endDate);

      // Get transactions for export
      const transactions = await this.transactionService.getTransactionsForExport(
        req.user.merchantId,
        query.startDate,
        query.endDate,
      );

      // Generate CSV content
      const csvContent = this.csvExportService.generateTransactionsCsv(transactions);
      
      // Generate filename
      const filename = this.csvExportService.generateFilename(
        req.user.merchantId,
        query.startDate,
        query.endDate,
      );

      // Set response headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send CSV content
      res.send(csvContent);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.message.includes('Invalid')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // Simulate payment completion (for testing purposes)
  @Post(':paymentId/complete')
  @ApiOperation({ 
    summary: 'Complete payment (simulation)',
    description: 'Simulates payment completion for testing purposes'
  })
  @ApiParam({ name: 'paymentId', description: 'Payment ID', example: 'uuid-payment-id' })
  @ApiBody({ type: CompletePaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Payment completion simulated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-transaction-id' },
            paymentId: { type: 'string', example: 'uuid-payment-id' },
            merchantId: { type: 'string', example: 'uuid-merchant-id' },
            amount: { type: 'number', example: 50.00 },
            cryptoType: { type: 'string', enum: ['bitcoin', 'lightning', 'ecash'] },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
            createdAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' }
          }
        },
        message: { type: 'string', example: 'Payment completed successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid payment data' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async completePayment(
    @Param('paymentId') paymentId: string,
    @Body() body: CompletePaymentDto,
  ) {
    try {
      const transaction = await this.transactionService.completePayment(
        paymentId,
        body.cryptoType,
        body.shouldFail || false,
      );

      return {
        success: true,
        transaction,
        message: transaction.status === 'completed' 
          ? 'Payment completed successfully' 
          : 'Payment failed',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  // Get payment status
  @Get('payment/:paymentId/status')
  @ApiOperation({ 
    summary: 'Get payment status',
    description: 'Retrieves the current status of a payment'
  })
  @ApiParam({ name: 'paymentId', description: 'Payment ID', example: 'uuid-payment-id' })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', example: 'uuid-payment-id' },
        status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
        createdAt: { type: 'string', format: 'date-time' },
        completedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid payment ID' })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  async getPaymentStatus(@Param('paymentId') paymentId: string) {
    try {
      const status = await this.transactionService.getPaymentStatus(paymentId);
      return status;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}