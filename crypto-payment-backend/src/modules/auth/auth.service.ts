import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Merchant, MerchantService } from '../merchant/merchant.service';
import { CryptoType } from '../../common/enums/crypto-type.enum';
import { SendOtpDto, VerifyOtpDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PhoneVerificationService } from './phone-verification.service';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => MerchantService))
    private readonly merchantService: MerchantService,
    private readonly phoneVerificationService: PhoneVerificationService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ merchantId: string; message: string }> {
    const { phoneNumber, firstName } = registerDto;

    // Check if merchant with this phone number already exists
    const existingMerchant =
      await this.merchantService.findByPhoneNumber(phoneNumber);

    if (existingMerchant) {
      throw new ConflictException(
        'Merchant with this phone number already exists',
      );
    }

    // Generate unique merchant ID
    const merchantId = this.generateMerchantId();

    // Create new merchant
    const newMerchant: Merchant = {
      id: merchantId,
      phoneNumber,
      isPhoneVerified: false,
      firstName,
      walletBalance: 200000,
      cryptoPreferences: [CryptoType.BITCOIN], // Default to Bitcoin
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store the merchant using merchant service
    await this.merchantService.createOrUpdateMerchant(newMerchant);

    // Automatically send OTP for phone verification
    await this.sendOtp({ phoneNumber });

    return {
      merchantId,
      message: 'Merchant account created successfully. OTP sent to your phone.',
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    const { phoneNumber } = sendOtpDto;

    // Check if merchant exists
    const merchant = await this.merchantService.findByPhoneNumber(phoneNumber);

    if (!merchant) {
      throw new NotFoundException('No account found with this phone number');
    }

    // Send OTP
    this.phoneVerificationService.sendOtp(phoneNumber);

    return { message: 'OTP sent to your phone number' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
    token: string;
    merchantId: string;
    phoneNumber: string;
    firstName: string;
  }> {
    const { phoneNumber, otp } = verifyOtpDto;

    // Find merchant by phone number
    const merchant = await this.merchantService.findByPhoneNumber(phoneNumber);

    if (!merchant) {
      throw new UnauthorizedException('Invalid phone number');
    }

    // Verify OTP
    this.phoneVerificationService.verifyOtp(phoneNumber, otp);

    // Mark phone as verified if not already
    if (!merchant.isPhoneVerified) {
      merchant.isPhoneVerified = true;
      merchant.updatedAt = new Date();
      await this.merchantService.createOrUpdateMerchant(merchant);
    }

    // Generate JWT token
    const token = this.jwtService.generateToken({
      merchantId: merchant.id,
      phoneNumber: merchant.phoneNumber!,
    });

    return {
      token,
      merchantId: merchant.id,
      phoneNumber: merchant.phoneNumber!,
      firstName: merchant.firstName,
    };
  }

  async findMerchantById(merchantId: string): Promise<Merchant | null> {
    return this.merchantService.findById(merchantId);
  }

  async findMerchantByPhoneNumber(
    phoneNumber: string,
  ): Promise<Merchant | null> {
    return this.merchantService.findByPhoneNumber(phoneNumber);
  }

  private generateMerchantId(): string {
    return `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}