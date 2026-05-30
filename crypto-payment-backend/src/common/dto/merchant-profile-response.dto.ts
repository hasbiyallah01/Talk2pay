import { CryptoType } from '../enums/crypto-type.enum';

export class MerchantProfileResponseDto {
  id: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
  firstName: string;
  walletBalance: number;
  cryptoPreferences: CryptoType[];
  createdAt: Date;
}
