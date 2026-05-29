import { CryptoType } from '../enums/crypto-type.enum';

export class MerchantProfileResponseDto {
  id: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
  businessName: string;
  cryptoPreferences: CryptoType[];
  createdAt: Date;
}
