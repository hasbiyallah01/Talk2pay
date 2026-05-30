import { IsPhoneNumber, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({
    description: 'Merchant phone number in international format',
    example: '+2348012345678',
    format: 'phone'
  })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number with country code' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Merchant phone number in international format',
    example: '+2348012345678',
    format: 'phone'
  })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number with country code' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP code received via SMS',
    example: '123456'
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
}
