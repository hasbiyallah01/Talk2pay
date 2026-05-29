import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PhoneVerificationEntity } from '../../entities/phone-verification.entity';

@Injectable()
export class PhoneVerificationService {
  private readonly logger = new Logger(PhoneVerificationService.name);
  private readonly otpLength = parseInt(process.env.OTP_CODE_LENGTH ?? '6', 10);
  private readonly otpExpiresInMinutes = parseInt(process.env.OTP_TTL_MINUTES ?? '10', 10);

  constructor(
    @InjectRepository(PhoneVerificationEntity)
    private readonly repo: Repository<PhoneVerificationEntity>,
  ) {}

  private generateOtp(): string {
    let otp = '';
    for (let i = 0; i < this.otpLength; i += 1) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  private getTwilioClient(): any | null {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Twilio = require('twilio');
    return Twilio(sid, token);
  }

  async sendOtp(phoneNumber: string): Promise<void> {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.otpExpiresInMinutes * 60_000);

    // Upsert: remove previous codes for this phone then save new
    await this.repo.delete({ phoneNumber });
    const rec = this.repo.create({ phoneNumber, otp, expiresAt });
    await this.repo.save(rec);

    const client = this.getTwilioClient();
    const message = `Your verification code is: ${otp}`;

    if (client && process.env.TWILIO_FROM) {
      try {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_FROM,
          to: phoneNumber,
        });
        this.logger.log(`Sent OTP via Twilio to ${phoneNumber}`);
        return;
      } catch (err) {
        this.logger.error('Twilio send failed, falling back to logger', err as any);
      }
    }

    // Fallback: log the OTP so developers can see it in non-prod environments
    this.logger.log(`OTP for ${phoneNumber}: ${otp}`);
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<void> {
    // Clean up expired entries first (optional, keep minimal)
    await this.repo.delete({ expiresAt: LessThan(new Date()) });

    const record = await this.repo.findOne({ where: { phoneNumber } });
    if (!record) {
      throw new BadRequestException('No OTP request found for this phone number');
    }

    if (record.expiresAt < new Date()) {
      await this.repo.delete({ phoneNumber });
      throw new BadRequestException('OTP has expired. Request a new code.');
    }

    if (record.otp !== otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    // Success: remove record
    await this.repo.delete({ phoneNumber });
  }
}
