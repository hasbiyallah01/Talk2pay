import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { MerchantService } from '../merchant/merchant.service';
import { AuthService } from '../auth/auth.service';

export interface FundingResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance?: number;
  paymentUrl?: string;
}

export enum FundingMethod {
  BANK_TRANSFER = 'bank_transfer',
  DEBIT_CARD = 'debit_card',
  CASH_DEPOSIT = 'cash_deposit',
  CRYPTO_DEPOSIT = 'crypto_deposit',
  MOBILE_MONEY = 'mobile_money',
}

@Injectable()
export class WalletFundingService {
  constructor(
    private readonly merchantService: MerchantService,
    private readonly authService: AuthService,
  ) {}

  async initiateFunding(
    phoneNumber: string,
    amount: number,
    method: FundingMethod,
    metadata?: any,
  ): Promise<FundingResponse> {
    try {
      // Validate amount
      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      if (amount > 10000) {
        throw new BadRequestException(
          'Maximum funding amount is $10,000 per transaction',
        );
      }

      // Find merchant
      const merchant =
        await this.authService.findMerchantByPhoneNumber(phoneNumber);
      if (!merchant) {
        throw new NotFoundException('Merchant not found');
      }

      // Generate transaction ID
      const transactionId = this.generateTransactionId();

      switch (method) {
        case FundingMethod.BANK_TRANSFER:
          return await this.handleBankTransfer(
            merchant,
            amount,
            transactionId,
            metadata,
          );

        case FundingMethod.DEBIT_CARD:
          return await this.handleDebitCard(
            merchant,
            amount,
            transactionId,
            metadata,
          );

        case FundingMethod.CASH_DEPOSIT:
          return await this.handleCashDeposit(
            merchant,
            amount,
            transactionId,
            metadata,
          );

        case FundingMethod.CRYPTO_DEPOSIT:
          return await this.handleCryptoDeposit(
            merchant,
            amount,
            transactionId,
            metadata,
          );

        case FundingMethod.MOBILE_MONEY:
          return await this.handleMobileMoney(
            merchant,
            amount,
            transactionId,
            metadata,
          );

        default:
          throw new BadRequestException('Unsupported funding method');
      }
    } catch (error) {
      console.error('Funding error:', error);
      return {
        success: false,
        message: error.message || 'Failed to initiate funding',
      };
    }
  }

  private async handleBankTransfer(
    merchant: any,
    amount: number,
    transactionId: string,
    metadata?: any,
  ): Promise<FundingResponse> {
    // For demo purposes, simulate bank transfer
    // In production, integrate with banking APIs

    return {
      success: true,
      message: `Bank transfer initiated for ₿${amount.toFixed(2)}. Please transfer to:\n\nAccount: 1234567890\nBank: Demo Bank\nReference: ${transactionId}\n\nFunds will reflect within 1-2 hours.`,
      transactionId,
      paymentUrl: `https://demobank.com/transfer?ref=${transactionId}&amount=${amount}`,
    };
  }

  private async handleDebitCard(
    merchant: any,
    amount: number,
    transactionId: string,
    metadata?: any,
  ): Promise<FundingResponse> {
    // Simulate card payment processing
    // In production, integrate with Stripe, Paystack, etc.

    return {
      success: true,
      message: `Card payment initiated for ₿${amount.toFixed(2)}. Complete payment using the link below.`,
      transactionId,
      paymentUrl: `https://pay.demo.com/card?ref=${transactionId}&amount=${amount}`,
    };
  }

  private async handleCashDeposit(
    merchant: any,
    amount: number,
    transactionId: string,
    metadata?: any,
  ): Promise<FundingResponse> {
    // Generate cash deposit instructions

    return {
      success: true,
      message: `Cash deposit for ₿${amount.toFixed(2)}:\n\nVisit any of our agent locations:\n• Lagos: 123 Victoria Island\n• Abuja: 456 Wuse II\n• Kano: 789 Sabon Gari\n\nReference: ${transactionId}\n\nShow this reference to the agent.`,
      transactionId,
    };
  }

  private async handleCryptoDeposit(
    merchant: any,
    amount: number,
    transactionId: string,
    metadata?: any,
  ): Promise<FundingResponse> {
    // Generate crypto deposit address
    const cryptoAddress = this.generateCryptoAddress();

    return {
      success: true,
      message: `Crypto deposit for ₿${amount.toFixed(2)}:\n\nSend Bitcoin to:\n${cryptoAddress}\n\nReference: ${transactionId}\n\nFunds will reflect after 3 confirmations.`,
      transactionId,
    };
  }

  private async handleMobileMoney(
    merchant: any,
    amount: number,
    transactionId: string,
    metadata?: any,
  ): Promise<FundingResponse> {
    // Simulate mobile money integration

    return {
      success: true,
      message: `Mobile money payment for ₿${amount.toFixed(2)}:\n\nDial *123*${amount}*${transactionId}# on your phone\n\nSupported networks:\n• MTN\n• Airtel\n• Glo\n• 9mobile`,
      transactionId,
    };
  }

  async completeFunding(
    transactionId: string,
    amount: number,
    phoneNumber: string,
  ): Promise<FundingResponse> {
    try {
      // Find merchant
      const merchant =
        await this.authService.findMerchantByPhoneNumber(phoneNumber);
      if (!merchant) {
        throw new NotFoundException('Merchant not found');
      }

      // Update wallet balance
      merchant.walletBalance = (merchant.walletBalance || 0) + amount;
      merchant.updatedAt = new Date();

      await this.merchantService.createOrUpdateMerchant(merchant);

      return {
        success: true,
        message: `Funding successful! ₿${amount.toFixed(2)} added to your wallet.`,
        transactionId,
        newBalance: merchant.walletBalance,
      };
    } catch (error) {
      console.error('Complete funding error:', error);
      return {
        success: false,
        message: 'Failed to complete funding',
      };
    }
  }

  private generateTransactionId(): string {
    return `fund_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateCryptoAddress(): string {
    // Generate a demo Bitcoin address
    return `bc1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }
}
