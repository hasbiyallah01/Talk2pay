import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CryptoType } from '../../../common/enums/crypto-type.enum';

export class FundWalletDto {
  @ApiProperty({
    description: 'Amount of crypto to add to the wallet',
    example: 1.25,
    minimum: 0.0001,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @ApiPropertyOptional({
    description: 'Crypto network type for the wallet funding',
    enum: CryptoType,
    example: CryptoType.BITCOIN,
  })
  @IsOptional()
  @IsEnum(CryptoType, { message: 'cryptoType must be a valid crypto network' })
  cryptoType?: CryptoType;

  @ApiPropertyOptional({
    description: 'Optional note or reference for the wallet funding',
    example: 'Deposit from exchange',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
