import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WhatsAppWebhookDto {
  @ApiProperty({
    description: 'The message body sent by the user',
    example: 'create 50 Coffee payment'
  })
  @IsString({ message: 'Body must be a string' })
  @IsNotEmpty({ message: 'Body is required' })
  Body: string;

  @ApiProperty({
    description: 'The phone number that sent the message (WhatsApp format)',
    example: 'whatsapp:+1234567890'
  })
  @IsString({ message: 'From must be a string' })
  @IsNotEmpty({ message: 'From is required' })
  @Matches(/^whatsapp:\+\d{10,15}$/, {
    message: 'From must be a valid WhatsApp phone number format (whatsapp:+1234567890)'
  })
  From: string;

  @ApiProperty({
    description: 'The WhatsApp sandbox number that received the message',
    example: 'whatsapp:+14155238886'
  })
  @IsString({ message: 'To must be a string' })
  @IsNotEmpty({ message: 'To is required' })
  @Matches(/^whatsapp:\+\d{10,15}$/, {
    message: 'To must be a valid WhatsApp phone number format (whatsapp:+1234567890)'
  })
  To: string;

  @ApiProperty({
    description: 'Unique identifier for the message from Twilio',
    example: 'SM1234567890abcdef1234567890abcdef'
  })
  @IsString({ message: 'MessageSid must be a string' })
  @IsNotEmpty({ message: 'MessageSid is required' })
  @Matches(/^SM[a-fA-F0-9]{32}$/, {
    message: 'MessageSid must be a valid Twilio message SID format'
  })
  MessageSid: string;

  @ApiPropertyOptional({
    description: 'The account SID associated with the message',
    example: 'AC1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString({ message: 'AccountSid must be a string' })
  @Matches(/^AC[a-fA-F0-9]{32}$/, {
    message: 'AccountSid must be a valid Twilio account SID format'
  })
  AccountSid?: string;

  @ApiPropertyOptional({
    description: 'The messaging service SID (if applicable)',
    example: 'MG1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString({ message: 'MessagingServiceSid must be a string' })
  MessagingServiceSid?: string;

  @ApiPropertyOptional({
    description: 'Number of media files attached to the message',
    example: '0'
  })
  @IsOptional()
  @IsString({ message: 'NumMedia must be a string' })
  @Matches(/^\d+$/, {
    message: 'NumMedia must be a numeric string'
  })
  NumMedia?: string;

  @ApiPropertyOptional({
    description: 'Profile name of the sender',
    example: 'John Doe'
  })
  @IsOptional()
  @IsString({ message: 'ProfileName must be a string' })
  ProfileName?: string;

  @ApiPropertyOptional({
    description: 'WhatsApp ID of the sender',
    example: 'whatsapp:+1234567890'
  })
  @IsOptional()
  @IsString({ message: 'WaId must be a string' })
  WaId?: string;

  @ApiPropertyOptional({
    description: 'External user ID associated with the message',
    example: '1234567890'
  })
  @IsOptional()
  @IsString({ message: 'ExternalUserId must be a string' })
  ExternalUserId?: string;

  @ApiPropertyOptional({
    description: 'Twilio SMS message SID for the message',
    example: 'SM1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString({ message: 'SmsMessageSid must be a string' })
  SmsMessageSid?: string;

  @ApiPropertyOptional({
    description: 'The type of message received',
    example: 'text'
  })
  @IsOptional()
  @IsString({ message: 'MessageType must be a string' })
  MessageType?: string;

  @ApiPropertyOptional({
    description: 'Twilio SMS SID for the message',
    example: 'SM1234567890abcdef1234567890abcdef'
  })
  @IsOptional()
  @IsString({ message: 'SmsSid must be a string' })
  SmsSid?: string;

  @ApiPropertyOptional({
    description: 'Status of the SMS message',
    example: 'received'
  })
  @IsOptional()
  @IsString({ message: 'SmsStatus must be a string' })
  SmsStatus?: string;

  @ApiPropertyOptional({
    description: 'Number of segments in the message',
    example: '1'
  })
  @IsOptional()
  @Matches(/^\d+$/, {
    message: 'NumSegments must be a numeric string'
  })
  NumSegments?: string;

  @ApiPropertyOptional({
    description: 'Number of media segments in the message referral',
    example: '0'
  })
  @IsOptional()
  @Matches(/^\d+$/, {
    message: 'ReferralNumMedia must be a numeric string'
  })
  ReferralNumMedia?: string;

  @ApiPropertyOptional({
    description: 'Channel metadata payload sent by Twilio',
    example: '{}'
  })
  @IsOptional()
  @IsString({ message: 'ChannelMetadata must be a string' })
  ChannelMetadata?: string;

  @ApiPropertyOptional({
    description: 'Twilio API version',
    example: '2010-04-01'
  })
  @IsOptional()
  @IsString({ message: 'ApiVersion must be a string' })
  ApiVersion?: string;

}