import { IsPhoneNumber, IsNotEmpty, IsString } from 'class-validator';
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
    description: 'Merchant first name',
    example: 'John'
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;
}
