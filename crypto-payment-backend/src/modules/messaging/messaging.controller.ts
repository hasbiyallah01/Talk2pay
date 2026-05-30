import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagingService, CommandResponse } from './messaging.service';

export class WhatsAppMessageDto {
  phoneNumber: string;
  message: string;
  deleteAfterRead?: boolean; // For PIN messages
}

export class UssdMessageDto {
  phoneNumber: string;
  message: string;
}

@ApiTags('messaging')
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('whatsapp')
  @ApiOperation({ 
    summary: 'Handle WhatsApp message',
    description: 'Process WhatsApp messages with wallet setup, PIN creation, and crypto operations'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Message processed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        isError: { type: 'boolean' },
        requiresInput: { type: 'boolean' },
        nextStep: { type: 'string' },
        deleteMessage: { type: 'boolean' }
      }
    }
  })
  async handleWhatsAppMessage(@Body() dto: WhatsAppMessageDto): Promise<CommandResponse> {
    return this.messagingService.handleWhatsAppMessage(dto.phoneNumber, dto.message);
  }

  @Post('ussd')
  @ApiOperation({ 
    summary: 'Handle USSD message',
    description: 'Process USSD messages with basic wallet operations'
  })
  @ApiResponse({ status: 200, description: 'Message processed successfully' })
  async handleUssdMessage(@Body() dto: UssdMessageDto): Promise<CommandResponse> {
    return this.messagingService.handleUssdMessage(dto.phoneNumber, dto.message);
  }
}