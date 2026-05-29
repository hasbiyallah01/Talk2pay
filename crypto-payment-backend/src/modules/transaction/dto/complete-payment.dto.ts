import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CryptoType } from '../../../common/enums/crypto-type.enum';

export class CompletePaymentDto {
  @ApiProperty({
    description: 'Cryptocurrency type for payment',
    enum: CryptoType,
    example: CryptoType.BITCOIN
  })
  @IsEnum(CryptoType, { message: 'Crypto type must be bitcoin, lightning, or ecash' })
  cryptoType: CryptoType;

  @ApiPropertyOptional({
    description: 'Whether to simulate payment failure (for testing)',
    example: false,
    default: false
  })
  @IsOptional()
  @IsBoolean({ message: 'shouldFail must be a boolean' })
  shouldFail?: boolean = false;
}