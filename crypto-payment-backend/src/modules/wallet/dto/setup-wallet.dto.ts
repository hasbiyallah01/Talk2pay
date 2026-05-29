import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetupWalletDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    minLength: 1,
    maxLength: 50
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  firstName: string;
}