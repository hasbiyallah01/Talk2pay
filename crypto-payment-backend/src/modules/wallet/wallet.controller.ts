import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsAppWalletService } from '../messaging/whatsapp-wallet.service';
import { MessagingService } from '../messaging/messaging.service';
import { WalletFundingService } from './wallet-funding.service';
import { SetupWalletDto } from './dto/setup-wallet.dto';
import { CreatePinDto } from './dto/create-pin.dto';
import { WalletCommandDto } from './dto/wallet-command.dto';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { CompleteFundingDto } from './dto/complete-funding.dto';

@ApiTags('wallet')
@ApiBearerAuth('JWT-auth')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly whatsappWalletService: WhatsAppWalletService,
    private readonly messagingService: MessagingService,
    private readonly walletFundingService: WalletFundingService,
  ) {}

  @Post('setup')
  @ApiOperation({ summary: 'Setup wallet for authenticated user' })
  @ApiResponse({ status: 200, description: 'Wallet setup initiated' })
  async setupWallet(@Request() req, @Body() body: SetupWalletDto) {
    const phoneNumber = req.user.phoneNumber;
    const result = await this.whatsappWalletService.setupWallet(phoneNumber, body.firstName);
    return result;
  }

  @Post('create-pin')
  @ApiOperation({ summary: 'Create wallet PIN' })
  @ApiResponse({ status: 200, description: 'PIN created successfully' })
  async createPin(@Request() req, @Body() body: CreatePinDto) {
    const phoneNumber = req.user.phoneNumber;
    const result = await this.whatsappWalletService.createPin(phoneNumber, body.pin);
    return result;
  }

  @Post('verify-pin')
  @ApiOperation({ summary: 'Verify wallet PIN' })
  @ApiResponse({ status: 200, description: 'PIN verification result' })
  async verifyPin(@Request() req, @Body() body: CreatePinDto) {
    const phoneNumber = req.user.phoneNumber;
    const isValid = await this.whatsappWalletService.verifyPin(phoneNumber, body.pin);
    return { isValid };
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Current wallet balance' })
  async getBalance(@Request() req) {
    const phoneNumber = req.user.phoneNumber;
    const response = await this.messagingService.handleWhatsAppMessage(phoneNumber, 'balance');
    return {
      balance: req.user.walletBalance || 0,
      message: response.message,
      isError: response.isError
    };
  }

  @Get('info')
  @ApiOperation({ summary: 'Get company information' })
  @ApiResponse({ status: 200, description: 'Company information' })
  async getCompanyInfo() {
    const info = await this.whatsappWalletService.getCompanyInfo();
    return { message: info };
  }

  @Post('command')
  @ApiOperation({ summary: 'Execute wallet command' })
  @ApiResponse({ status: 200, description: 'Command executed' })
  async executeCommand(@Request() req, @Body() body: WalletCommandDto) {
    const phoneNumber = req.user.phoneNumber;
    const result = await this.messagingService.handleWhatsAppMessage(phoneNumber, body.command);
    return result;
  }

  @Post('fund')
  @ApiOperation({ summary: 'Initiate wallet funding' })
  @ApiResponse({ status: 200, description: 'Funding initiated successfully' })
  async fundWallet(@Request() req, @Body() body: FundWalletDto) {
    const phoneNumber = req.user.phoneNumber;
    const result = await this.walletFundingService.initiateFunding(
      phoneNumber,
      body.amount,
      body.method,
      body.metadata
    );
    return result;
  }

  @Post('fund/complete')
  @ApiOperation({ summary: 'Complete wallet funding' })
  @ApiResponse({ status: 200, description: 'Funding completed successfully' })
  async completeFunding(@Request() req, @Body() body: CompleteFundingDto) {
    const phoneNumber = req.user.phoneNumber;
    const result = await this.walletFundingService.completeFunding(
      body.transactionId,
      body.amount,
      phoneNumber
    );
    return result;
  }

  @Get('funding-methods')
  @ApiOperation({ summary: 'Get available funding methods' })
  @ApiResponse({ status: 200, description: 'Available funding methods' })
  async getFundingMethods() {
    return {
      methods: [
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Transfer from your bank account',
          processingTime: '1-2 hours',
          fees: 'Free'
        },
        {
          id: 'debit_card',
          name: 'Debit Card',
          description: 'Pay with your debit card',
          processingTime: 'Instant',
          fees: '2.5%'
        },
        {
          id: 'cash_deposit',
          name: 'Cash Deposit',
          description: 'Deposit cash at agent locations',
          processingTime: 'Instant',
          fees: 'Free'
        },
        {
          id: 'crypto_deposit',
          name: 'Crypto Deposit',
          description: 'Send Bitcoin to your wallet',
          processingTime: '30-60 minutes',
          fees: 'Network fees only'
        },
        {
          id: 'mobile_money',
          name: 'Mobile Money',
          description: 'Pay with MTN, Airtel, Glo, 9mobile',
          processingTime: 'Instant',
          fees: '1%'
        }
      ]
    };
  }
}