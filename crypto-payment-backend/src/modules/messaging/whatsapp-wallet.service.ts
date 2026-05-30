import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { MerchantService } from '../merchant/merchant.service';
import * as bcrypt from 'bcrypt';

export interface WalletSetupResponse {
  message: string;
  isError: boolean;
  requiresPin?: boolean;
  nextStep?: string;
}

@Injectable()
export class WhatsAppWalletService {
  private readonly saltRounds = 10;

  constructor(
    private readonly authService: AuthService,
    private readonly merchantService: MerchantService,
  ) {}

  async setupWallet(
    phoneNumber: string,
    firstName: string,
  ): Promise<WalletSetupResponse> {
    try {
      // Check if merchant already exists
      let merchant =
        await this.authService.findMerchantByPhoneNumber(phoneNumber);

      if (merchant) {
        if (merchant.walletPin) {
          return {
            message: `Welcome back ${firstName}! \n\nYour Talk2Pay wallet is already set up.\n\nType 'balance' to check your wallet or 'help' for available commands.\n\n For transactions, you'll need your secure PIN.`,
            isError: false,
          };
        } else {
          return {
            message: `Hello ${firstName}! \n\nYour account exists but needs a secure PIN for WhatsApp transactions.\n\n Please create a 4-6 digit PIN that only you know.\n\n️ IMPORTANT: This message will disappear for security. Remember your PIN!\n\nSend your PIN now (it will be hidden):`,
            isError: false,
            requiresPin: true,
            nextStep: 'create_pin',
          };
        }
      } else {
        // Create new merchant account
        const merchantId = this.generateMerchantId();

        const newMerchant = {
          id: merchantId,
          phoneNumber,
          isPhoneVerified: true, // Auto-verified via WhatsApp
          firstName,
          walletBalance: 0,
          cryptoPreferences: ['BITCOIN' as any],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.merchantService.createOrUpdateMerchant(newMerchant);

        return {
          message: `Welcome to Talk2Pay, ${firstName}! \n\n Your wallet has been created!\n Phone verified automatically via WhatsApp\n Starting balance: $0.00\n\n Now create a secure 4-6 digit PIN for transactions.\n\n️ IMPORTANT: This PIN will be encrypted and this message will disappear for security.\n\nSend your PIN now:`,
          isError: false,
          requiresPin: true,
          nextStep: 'create_pin',
        };
      }
    } catch (error) {
      return {
        message:
          'Sorry, there was an error setting up your wallet. Please try again or contact support.',
        isError: true,
      };
    }
  }

  async createPin(
    phoneNumber: string,
    pin: string,
  ): Promise<WalletSetupResponse> {
    try {
      // Validate PIN format
      if (!/^\d{4,6}$/.test(pin)) {
        return {
          message:
            ' Invalid PIN format.\n\nPlease send a 4-6 digit number only.\nExample: 1234 or 123456',
          isError: true,
          requiresPin: true,
          nextStep: 'create_pin',
        };
      }

      const merchant =
        await this.authService.findMerchantByPhoneNumber(phoneNumber);
      if (!merchant) {
        return {
          message:
            'Account not found. Please type "setup" to create your wallet first.',
          isError: true,
        };
      }

      // Hash and save PIN
      const hashedPin = await bcrypt.hash(pin, this.saltRounds);
      merchant.walletPin = hashedPin;
      merchant.updatedAt = new Date();

      await this.merchantService.createOrUpdateMerchant(merchant);

      return {
        message: ` Perfect, ${merchant.firstName}!\n\n Your secure PIN has been created and encrypted\n Your wallet is now fully set up and ready!\n\n Current balance: ₿${parseFloat(merchant.walletBalance?.toString() || '0').toFixed(2)}\n\nWhat would you like to do?\n• Type 'fund' to add money\n• Type 'balance' to check wallet\n• Type 'help' for all commands\n\n Welcome to the future of payments!`,
        isError: false,
      };
    } catch (error) {
      console.error('Error in createPin:', error);
      return {
        message: 'Error creating PIN. Please try again or contact support.',
        isError: true,
      };
    }
  }

  async verifyPin(phoneNumber: string, pin: string): Promise<boolean> {
    try {
      const merchant =
        await this.authService.findMerchantByPhoneNumber(phoneNumber);
      if (!merchant || !merchant.walletPin) {
        return false;
      }

      return await bcrypt.compare(pin, merchant.walletPin);
    } catch (error) {
      return false;
    }
  }

  async getCompanyInfo(): Promise<string> {
    return ` About Talk2Pay\n\n What we do:\n• Send & receive cryptocurrency instantly\n• Convert crypto to cash\n• Pay bills with crypto\n• Secure wallet with bank-level security\n\n Why choose us:\n• No hidden fees\n• 24/7 support\n• Lightning-fast transactions\n• Works with all major cryptocurrencies\n\n Available on:\n• WhatsApp (you're here!)\n• Mobile app\n• Web dashboard\n• USSD codes\n\n Security first:\n• Military-grade encryption\n• Your keys, your crypto\n• PIN-protected transactions\n\n Need help? Type 'support'\n Ready to start? Type 'setup'`;
  }

  private generateMerchantId(): string {
    return `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
