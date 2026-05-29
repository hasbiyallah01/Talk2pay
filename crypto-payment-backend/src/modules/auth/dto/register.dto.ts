import { IsPhoneNumber, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Merchant phone number in international format',
    example: '+2348012345678',
    format: 'phone'
  })
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number with country code' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @ApiProperty({
    description: 'Merchant password (minimum 6 characters)',
    example: 'securePassword123',
    minLength: 6
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Business name',
    example: 'My Coffee Shop'
  })
  @IsString({ message: 'Business name must be a string' })
  @IsNotEmpty({ message: 'Business name is required' })
  businessName: string;
}
