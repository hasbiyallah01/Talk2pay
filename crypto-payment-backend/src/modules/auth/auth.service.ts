import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Merchant, MerchantService } from '../merchant/merchant.service';
import { CryptoType } from '../../common/enums/crypto-type.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PhoneVerificationService } from './phone-verification.service';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @Inject(forwardRef(() => MerchantService)) private readonly merchantService: MerchantService,
    private readonly phoneVerificationService: PhoneVerificationService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ merchantId: string; message: string }> {
    const { phoneNumber, password, businessName } = registerDto;

    // Check if merchant with this phone number already exists
    const existingMerchant = await this.merchantService.findByPhoneNumber(phoneNumber);

    if (existingMerchant) {
      throw new ConflictException('Merchant with this phone number already exists');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, this.saltRounds);

    // Generate unique merchant ID
    const merchantId = this.generateMerchantId();

    // Create new merchant
    const newMerchant: Merchant = {
      id: merchantId,
      phoneNumber,
      isPhoneVerified: false,
      passwordHash,
      businessName,
      cryptoPreferences: [CryptoType.BITCOIN], // Default to Bitcoin
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store the merchant using merchant service
    await this.merchantService.createOrUpdateMerchant(newMerchant);

    return {
      merchantId,
      message: 'Merchant account created successfully',
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ merchantId: string; phoneNumber: string; businessName: string }> {
    const { phoneNumber, password } = loginDto;

    // Find merchant by phone number using merchant service
    const merchant = await this.merchantService.findByPhoneNumber(phoneNumber);

    if (!merchant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password,
      merchant.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      merchantId: merchant.id,
      phoneNumber: merchant.phoneNumber!,
      businessName: merchant.businessName,
    };
  }

  async sendPhoneVerificationOtp(merchantId: string): Promise<{ message: string }> {
    const merchant = await this.merchantService.findById(merchantId);

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    if (!merchant.phoneNumber) {
      throw new BadRequestException('Merchant does not have a registered phone number');
    }

    this.phoneVerificationService.sendOtp(merchant.phoneNumber);

    return { message: 'OTP sent to registered phone number' };
  }

  async verifyPhoneOtp(merchantId: string, otp: string): Promise<{ message: string }> {
    const merchant = await this.merchantService.findById(merchantId);

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    if (!merchant.phoneNumber) {
      throw new BadRequestException('Merchant does not have a registered phone number');
    }

    this.phoneVerificationService.verifyOtp(merchant.phoneNumber, otp);

    merchant.isPhoneVerified = true;
    merchant.updatedAt = new Date();
    await this.merchantService.createOrUpdateMerchant(merchant);

    return { message: 'Phone number verified successfully' };
  }

  async findMerchantById(merchantId: string): Promise<Merchant | null> {
    return this.merchantService.findById(merchantId);
  }

  private generateMerchantId(): string {
    return `merchant_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
