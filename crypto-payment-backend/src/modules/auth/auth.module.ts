import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PhoneVerificationService } from './phone-verification.service';
import { MerchantModule } from '../merchant/merchant.module';
import { PhoneVerificationEntity } from '../../entities/phone-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneVerificationEntity]), forwardRef(() => MerchantModule)],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtAuthGuard, PhoneVerificationService],
  exports: [AuthService, JwtService, JwtAuthGuard, PhoneVerificationService],
})
export class AuthModule {}