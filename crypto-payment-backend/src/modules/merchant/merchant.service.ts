import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoType } from '../../common/enums/crypto-type.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { TransactionEntity } from '../../entities/transaction.entity';
import { UpdateCryptoPreferencesDto } from './dto/update-crypto-preferences.dto';
import { TransactionService } from '../transaction/transaction.service';
import { MerchantEntity } from '../../entities/merchant.entity';

export interface Merchant {
  id: string;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  firstName: string;
  walletPin?: string;
  walletBalance: number;
  cryptoPreferences: CryptoType[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(MerchantEntity)
    private readonly merchantRepository: Repository<MerchantEntity>,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService
  ) {}

  // Retrieve merchant profile by ID
  async getProfile(merchantId: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId }
    });
    
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
    }

    return merchant;
  }

  // Update merchant's crypto preferences
  async updateCryptoPreferences(
    merchantId: string,
    updateDto: UpdateCryptoPreferencesDto,
  ): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId }
    });
    
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
    }

    // Validate crypto preferences (additional validation beyond DTO)
    this.validateCryptoPreferences(updateDto.cryptoPreferences);

    // Update merchant's crypto preferences
    merchant.cryptoPreferences = updateDto.cryptoPreferences;
    merchant.updatedAt = new Date();

    // Save updated merchant
    const updatedMerchant = await this.merchantRepository.save(merchant);

    return updatedMerchant;
  }

  // Create or update merchant (used by auth service)
  async createOrUpdateMerchant(merchant: Merchant): Promise<Merchant> {
    console.log('Creating/updating merchant:', merchant);
    const merchantEntity = this.merchantRepository.create(merchant);
    console.log('Created entity:', merchantEntity);
    const savedMerchant = await this.merchantRepository.save(merchantEntity);
    console.log('Saved merchant:', savedMerchant);
    return savedMerchant;
  }

  // Find merchant by phone number (used by auth service)
  async findByPhoneNumber(phoneNumber: string): Promise<Merchant | null> {
    const merchant = await this.merchantRepository.findOne({
      where: { phoneNumber }
    });
    return merchant || null;
  }

  // Find merchant by ID (used by auth service)
  async findById(merchantId: string): Promise<Merchant | null> {
    const merchant = await this.merchantRepository.findOne({
      where: { id: merchantId }
    });
    return merchant || null;
  }

  // Get dashboard summary for merchant
  async getDashboardSummary(merchantId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    recentTransactions: TransactionEntity[];
    totalTransactions: number;
  }> {
    // Verify merchant exists
    const merchant = await this.findById(merchantId);
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID ${merchantId} not found`);
    }

    // Get all transactions for the merchant
    const allTransactions = await this.transactionService.getTransactionsForExport(merchantId);
    
    // Filter only successful payments for totals (Requirement 6.5)
    const successfulTransactions = allTransactions.filter(
      transaction => transaction.status === PaymentStatus.COMPLETED
    );

    // Calculate total payments and amount from successful transactions
    const totalPayments = successfulTransactions.length;
    const totalAmount = successfulTransactions.reduce(
      (sum, transaction) => sum + transaction.amount, 
      0
    );

    // Get recent transactions (last 10, including all statuses for visibility)
    const recentTransactions = allTransactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      totalPayments,
      totalAmount,
      recentTransactions,
      totalTransactions: allTransactions.length,
    };
  }

  // Validate crypto preferences array
  private validateCryptoPreferences(preferences: CryptoType[]): void {
    // Check for duplicates
    const uniquePreferences = new Set(preferences);
    if (uniquePreferences.size !== preferences.length) {
      throw new Error('Duplicate crypto preferences are not allowed');
    }

    // Ensure all preferences are valid enum values
    const validCryptoTypes = Object.values(CryptoType);
    for (const preference of preferences) {
      if (!validCryptoTypes.includes(preference)) {
        throw new Error(`Invalid crypto preference: ${preference}`);
      }
    }
  }
}