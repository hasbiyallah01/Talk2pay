import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { UpdateCryptoPreferencesDto } from './dto/update-crypto-preferences.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';

@ApiTags('merchant')
@ApiBearerAuth('JWT-auth')
@Controller('merchant')
@UseGuards(JwtAuthGuard)
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get merchant profile',
    description: 'Retrieves the authenticated merchant\'s profile information'
  })
  @ApiResponse({
    status: 200,
    description: 'Merchant profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid-merchant-id' },
            phoneNumber: { type: 'string', example: '+2348012345678' },
            isPhoneVerified: { type: 'boolean', example: false },
            firstName: { type: 'string', example: 'Meeee' },
            cryptoPreferences: {
              type: 'array',
              items: { type: 'string', enum: ['bitcoin', 'lightning', 'ecash'] },
              example: ['bitcoin', 'lightning']
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async getProfile(@Request() request: AuthenticatedRequest) {
    const merchantId = request.user.merchantId;
    return await this.merchantService.getProfile(merchantId);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Look up a merchant by phone number' })
  async lookupMerchant(@Query('query') query: string) {
    if (!query) {
      throw new NotFoundException('Query is required');
    }

    // Normalize phone format: 08100974320 → +2348100974320
    let normalized = query.trim();
    if (normalized.startsWith('0')) {
      normalized = '+234' + normalized.slice(1);
    }

    const merchant = await this.merchantService.findByPhoneNumber(normalized);
    if (!merchant) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: {
        id: merchant.id,
        firstName: merchant.firstName,
        phoneNumber: merchant.phoneNumber,
      },
    };
  }

  @Put('crypto-preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update crypto preferences',
    description: 'Updates the merchant\'s accepted cryptocurrency preferences'
  })
  @ApiBody({ type: UpdateCryptoPreferencesDto })
  @ApiResponse({
    status: 200,
    description: 'Crypto preferences updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Crypto preferences updated successfully' },
            cryptoPreferences: {
              type: 'array',
              items: { type: 'string', enum: ['bitcoin', 'lightning', 'ecash'] },
              example: ['bitcoin', 'lightning']
            }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid crypto preferences' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async updateCryptoPreferences(
    @Request() request: AuthenticatedRequest,
    @Body() updateDto: UpdateCryptoPreferencesDto,
  ) {
    const merchantId = request.user.merchantId;
    return await this.merchantService.updateCryptoPreferences(merchantId, updateDto);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard summary',
    description: 'Retrieves merchant dashboard with payment totals and recent transactions'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary retrieved successfully',
    type: DashboardSummaryDto
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async getDashboard(@Request() request: AuthenticatedRequest): Promise<DashboardSummaryDto> {
    const merchantId = request.user.merchantId;
    return await this.merchantService.getDashboardSummary(merchantId);
  }
}