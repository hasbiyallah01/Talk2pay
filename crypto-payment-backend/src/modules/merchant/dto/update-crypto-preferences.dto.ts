import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CryptoType } from '../../../common/enums/crypto-type.enum';

export class UpdateCryptoPreferencesDto {
  @ApiProperty({
    description: 'Array of accepted cryptocurrency types',
    example: ['bitcoin', 'lightning'],
    enum: CryptoType,
    isArray: true,
    minItems: 1
  })
  @IsArray({ message: 'Crypto preferences must be an array' })
  @IsNotEmpty({ message: 'At least one crypto preference is required' })
  @IsEnum(CryptoType, {
    each: true,
    message:
      'Each crypto preference must be a valid crypto type (bitcoin, lightning, ecash)',
  })
  cryptoPreferences: CryptoType[];
}
