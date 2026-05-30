import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WalletCommandDto {
  @ApiProperty({
    description: 'Wallet command to execute',
    example: 'balance',
    enum: ['balance', 'fund', 'send', 'receive', 'help', 'history', 'settings']
  })
  @IsString()
  @IsNotEmpty()
  command: string;
}