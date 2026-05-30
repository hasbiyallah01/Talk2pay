import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePinDto {
  @ApiProperty({
    description: 'Wallet PIN (4-6 digits)',
    example: '1234',
    minLength: 4,
    maxLength: 6,
    pattern: '^\\d{4,6}$'
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6)
  @Matches(/^\d{4,6}$/, { message: 'PIN must be 4-6 digits only' })
  pin: string;
}