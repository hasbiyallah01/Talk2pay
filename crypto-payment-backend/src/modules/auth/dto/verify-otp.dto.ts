import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'One-time password sent to the merchant phone number',
    example: '123456',
    minLength: 4,
    maxLength: 8,
  })
  @IsString({ message: 'OTP code must be a string' })
  @Length(4, 8, { message: 'OTP code must be between 4 and 8 digits' })
  @IsNotEmpty({ message: 'OTP code is required' })
  otp: string;
}
