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

export class SendCryptoDto {
  @ApiProperty({
    description: 'Amount of crypto to send',
    example: 0.5,
    minimum: 0.0001,
  })
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be a positive number' })
  @IsNotEmpty({ message: 'Amount is required' })
  amount: number;

  @ApiProperty({
    description: 'Recipient wallet address for the crypto transfer',
    example: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  })
  @IsString({ message: 'Recipient address must be a string' })
  @IsNotEmpty({ message: 'Recipient address is required' })
  recipientAddress: string;

  @ApiPropertyOptional({
    description: 'Crypto network type to use for this send operation',
    enum: CryptoType,
    example: CryptoType.BITCOIN,
  })
  @IsOptional()
  @IsEnum(CryptoType, { message: 'cryptoType must be a valid crypto network' })
  cryptoType?: CryptoType;

  @ApiPropertyOptional({
    description: 'Optional note or memo for the send transaction',
    example: 'Rent payment',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}
