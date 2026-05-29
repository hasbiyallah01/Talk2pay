import { IsPhoneNumber, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Merchant phone number in international format',
    example: '+2348012345678',
    format: 'phone'
  })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number with country code' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Merchant password',
    example: 'securePassword123'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
