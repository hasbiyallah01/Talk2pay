import { IsEnum, IsNotEmpty } from 'class-validator';
import { CryptoType } from '../../../common/enums/crypto-type.enum';

export class CompletePaymentDto {
  @IsEnum(CryptoType, {
    message: 'Crypto type must be a valid type (bitcoin, lightning, ecash)',
  })
  @IsNotEmpty({ message: 'Crypto type is required' })
  cryptoType: CryptoType;
}
