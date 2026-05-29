import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AuthThrottle, RegisterThrottle } from '../../common/decorators/auth-throttle.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedRequest } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @RegisterThrottle()
  @ApiOperation({ 
    summary: 'Register a new merchant account',
    description: 'Creates a new merchant account with phone number, password, and business details'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Merchant account created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            merchantId: { type: 'string', example: 'uuid-merchant-id' },
            message: { type: 'string', example: 'Merchant registered successfully' }
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
  @AuthThrottle()
  @ApiOperation({ 
    summary: 'Authenticate merchant',
    description: 'Authenticates merchant with phone number and password, returns JWT token'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            merchant: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-merchant-id' },
                phoneNumber: { type: 'string', example: '+2348012345678' },
                businessName: { type: 'string', example: 'My Business' }
              }
            }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    const merchantData = await this.authService.login(loginDto);
    
    const token = this.jwtService.generateToken({
      merchantId: merchantData.merchantId,
      phoneNumber: merchantData.phoneNumber,
    });

    return {
      success: true,
      data: {
        token,
        merchant: {
          id: merchantData.merchantId,
          phoneNumber: merchantData.phoneNumber,
          businessName: merchantData.businessName,
        },
      },
    };
  }

  @Post('send-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Send verification OTP to merchant phone number',
    description: 'Sends a one-time code to the authenticated merchant phone number for dashboard verification.'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'OTP sent to registered phone number' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async sendOtp(@Request() request: AuthenticatedRequest) {
    const merchantId = request.user.merchantId;
    return await this.authService.sendPhoneVerificationOtp(merchantId);
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Verify phone number using OTP',
    description: 'Verifies the authenticated merchant phone number using the one-time code sent via SMS.'
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Phone number verified successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Phone number verified successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP code' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async verifyOtp(
    @Request() request: AuthenticatedRequest,
    @Body(ValidationPipe) verifyOtpDto: VerifyOtpDto,
  ) {
    const merchantId = request.user.merchantId;
    return await this.authService.verifyPhoneOtp(merchantId, verifyOtpDto.otp);
  }
}
