import { IsString, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class USSDWebhookDto {
  @ApiProperty({
    description: 'Unique session identifier for the USSD session',
    example: 'ATUid_12345678901234567890123456789012'
  })
  @IsString({ message: 'sessionId must be a string' })
  @IsNotEmpty({ message: 'sessionId is required' })
  @Matches(/^ATUid_[a-zA-Z0-9]{32,40}$/, {
    message: 'sessionId must be a valid Africa\'s Talking session ID format (ATUid_xxxxx)'
  })
  sessionId: string;

  @ApiProperty({
    description: 'The USSD service code that was dialed',
    example: '*384*1234#'
  })
  @IsString({ message: 'serviceCode must be a string' })
  @IsNotEmpty({ message: 'serviceCode is required' })
  @Matches(/^\*\d{3,4}(\*\d*)*#?$/, {
    message: 'serviceCode must be a valid USSD code format (*XXX# or *XXXX#)'
  })
  serviceCode: string;

  @ApiProperty({
    description: 'The phone number of the user making the USSD request',
    example: '+254712345678'
  })
  @IsString({ message: 'phoneNumber must be a string' })
  @IsNotEmpty({ message: 'phoneNumber is required' })
  @Matches(/^\+\d{10,15}$/, {
    message: 'phoneNumber must be a valid international phone number format (+1234567890)'
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The user input text sequence (empty for initial request, contains user selections separated by *)',
    example: '1*50'
  })
  @IsString({ message: 'text must be a string' })
  text: string;

  @ApiPropertyOptional({
    description: 'Network code of the user\'s mobile network operator',
    example: '63902'
  })
  @IsOptional()
  @IsString({ message: 'networkCode must be a string' })
  @Matches(/^\d{5,6}$/, {
    message: 'networkCode must be a valid network code (5-6 digits)'
  })
  networkCode?: string;

  @ApiPropertyOptional({
    description: 'Cost of the USSD session in the local currency',
    example: 'KES 0.00'
  })
  @IsOptional()
  @IsString({ message: 'cost must be a string' })
  cost?: string;
}