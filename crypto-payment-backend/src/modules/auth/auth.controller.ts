import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new merchant account',
    description: 'Creates a new merchant account with phone number and first name. Automatically sends OTP for verification.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Merchant account created successfully and OTP sent',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            merchantId: { type: 'string', example: 'merchant_1234567890_abc123' },
            message: { type: 'string', example: 'Merchant account created successfully. OTP sent to your phone.' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or validation errors' })
  @ApiConflictResponse({ description: 'Phone number already exists' })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    
    return {
      success: true,
      data: {
        merchantId: result.merchantId,
        message: result.message,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Send OTP to phone number',
    description: 'Sends a one-time password to the registered phone number for authentication'
  })
  @ApiBody({ type: SendOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'OTP sent to your phone number' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid phone number format' })
  @ApiUnauthorizedResponse({ description: 'Phone number not registered' })
  async sendOtp(@Body(ValidationPipe) sendOtpDto: SendOtpDto) {
    const result = await this.authService.sendOtp(sendOtpDto);
    
    return {
      success: true,
      message: result.message,
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify OTP and authenticate',
    description: 'Verifies the OTP and returns authentication token with merchant details'
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully, JWT bearer token returned',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjaGFudElkIjoibWVyY2hhbnRfMTIzNDU2Nzg5MF9hYmMxMjMiLCJwaG9uZU51bWJlciI6IisyMzQ4MDEyMzQ1Njc4IiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTg4MDB9.signature' },
            merchant: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'merchant_1234567890_abc123' },
                phoneNumber: { type: 'string', example: '+2348012345678' },
                firstName: { type: 'string', example: 'John' }
              }
            }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid OTP or phone number' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async verifyOtp(@Body(ValidationPipe) verifyOtpDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(verifyOtpDto);
    
    return {
      success: true,
      data: {
        token: result.token,
        merchant: {
          id: result.merchantId,
          phoneNumber: result.phoneNumber,
          firstName: result.firstName,
        },
      },
    };
  }
}