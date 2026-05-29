import { TransactionResponseDto } from './transaction-response.dto';

export class DashboardResponseDto {
  totalPaymentsReceived: number;
  recentTransactions: TransactionResponseDto[];
}
