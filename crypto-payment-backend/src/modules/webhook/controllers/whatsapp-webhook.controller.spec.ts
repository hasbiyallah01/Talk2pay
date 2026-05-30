import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { PaymentService } from '../../payment/payment.service';
import { MerchantService } from '../../merchant/merchant.service';
import { WhatsAppWebhookDto } from '../dto/whatsapp-webhook.dto';
import { PaymentEntity } from '../../../entities/payment.entity';
import { MerchantEntity } from '../../../entities/merchant.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';

describe('WhatsAppWebhookController', () => {
  let controller: WhatsAppWebhookController;
  let paymentService: jest.Mocked<PaymentService>;

  const mockPaymentEntity: PaymentEntity = {
    id: 'test-payment-id',
    merchantId: 'webhook-system',
    amount: 50,
    description: 'Test payment',
    status: PaymentStatus.PENDING,
    createdAt: new Date('2023-01-01T00:00:00Z'),
    completedAt: undefined,
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    merchant: {
      id: 'webhook-system',
      phoneNumber: '+23465789567',
      businessName: 'Test Business',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as MerchantEntity,
   };

  const mockWhatsAppWebhookDto: WhatsAppWebhookDto = {
    Body: 'create 50 coffee',
    From: 'whatsapp:+1234567890',
    To: 'whatsapp:+14155238886',
    MessageSid: 'SM1234567890abcdef1234567890abcdef',
  };

  beforeEach(async () => {
    const mockPaymentService = {
      createPaymentRequest: jest.fn(),
      generatePaymentLink: jest.fn(),
      sendCrypto: jest.fn(),
    };

    const mockMerchantService = {
      findByPhoneNumber: jest.fn().mockResolvedValue({
        id: 'webhook-system',
        phoneNumber: '+23465789567',
        businessName: 'Test Business',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsAppWebhookController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
        {
          provide: MerchantService,
          useValue: mockMerchantService,
        },
      ],
    }).compile();

    controller = module.get<WhatsAppWebhookController>(WhatsAppWebhookController);
    paymentService = module.get(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWhatsAppWebhook', () => {
    describe('create command', () => {
      it('should create payment and return TwiML response for valid create command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create 50 coffee payment' };
        paymentService.createPaymentRequest.mockResolvedValue(mockPaymentEntity);
        paymentService.generatePaymentLink.mockReturnValue('http://localhost:3000/payment/test-payment-id');

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).toHaveBeenCalledWith('webhook-system', {
          amount: 50,
          description: 'coffee payment',
        });
        expect(paymentService.generatePaymentLink).toHaveBeenCalledWith('test-payment-id');
        expect(result).toContain('<Response><Message>');
        expect(result).toContain('Payment Created');
        expect(result).toContain('Amount: 50');
        expect(result).toContain('Description: Test payment');
        expect(result).toContain('Link: http://localhost:3000/payment/test-payment-id');
        expect(result).toContain('</Message></Response>');
      });

      it('should create payment without description when not provided', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create 25' };
        const paymentWithoutDescription = { ...mockPaymentEntity, amount: 25, description: undefined };
        paymentService.createPaymentRequest.mockResolvedValue(paymentWithoutDescription);
        paymentService.generatePaymentLink.mockReturnValue('http://localhost:3000/payment/test-payment-id');

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).toHaveBeenCalledWith('webhook-system', {
          amount: 25,
          description: undefined,
        });
        expect(result).toContain('Description: N/A');
      });

      it('should return error for create command without amount', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
        expect(result).toContain('<Response><Message>');
        expect(result).toContain('Error: Create command requires an amount');
        expect(result).toContain('Usage: create &lt;amount&gt; [description]');
        expect(result).toContain('</Message></Response>');
      });

      it('should return error for create command with invalid amount', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create abc' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
        expect(result).toContain('Error: Amount must be a positive number');
      });

      it('should return error for create command with negative amount', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create -10' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
        expect(result).toContain('Error: Amount must be a positive number');
      });

      it('should return error for create command with zero amount', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create 0' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
        expect(result).toContain('Error: Amount must be a positive number');
      });

      it('should handle payment service errors gracefully', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create 50 coffee' };
        paymentService.createPaymentRequest.mockRejectedValue(new Error('Database error'));

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(result).toContain('<Response><Message>');
        expect(result).toContain('Payment creation failed. Please try again.');
        expect(result).toContain('Send &quot;help&quot; for available commands.');
        expect(result).toContain('</Message></Response>');
      });
    });

    describe('help command', () => {
      it('should return help message for help command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'help' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
        expect(result).toContain('<Response><Message>');
        expect(result).toContain('Available Commands:');
        expect(result).toContain('• create &lt;amount&gt; [description] - Create a payment request');
        expect(result).toContain('• send &lt;amount&gt; &lt;recipient_address&gt; [description] - Send crypto');
        expect(result).toContain('• help - Show this help message');
        expect(result).toContain('Example: create 50 Coffee payment');
        expect(result).toContain('</Message></Response>');
      });

      it('should handle case-insensitive help command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'HELP' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(result).toContain('Available Commands:');
      });

      it('should return onboarding instructions for join command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'join' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(result).toContain('Welcome to Talk2Pay!');
        expect(result).toContain('To receive crypto, send: create &lt;amount&gt; [description]');
        expect(result).toContain('To send crypto, send: send &lt;amount&gt; &lt;recipient_address&gt; [description]');
      });
    });

    describe('send command', () => {
      it('should create send transaction and return TwiML response for valid send command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'send 0.5 bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh Rent' };
        const mockSendResult = {
          transaction: {
            id: 'txn_send_id',
            amount: 0.5,
            cryptoType: 'bitcoin',
            recipientAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            description: 'Rent',
            status: 'completed',
            createdAt: new Date('2023-01-01T00:00:00Z'),
            completedAt: new Date('2023-01-01T00:00:00Z'),
          },
        };

        paymentService.sendCrypto.mockResolvedValue(mockSendResult);

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.sendCrypto).toHaveBeenCalledWith('webhook-system', {
          amount: 0.5,
          recipientAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          description: 'Rent',
        });
        expect(result).toContain('Crypto Send Created');
        expect(result).toContain('Amount: 0.5');
        expect(result).toContain('Network: bitcoin');
        expect(result).toContain('Recipient: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
        expect(result).toContain('Description: Rent');
      });

      it('should return error for send command without recipient address', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'send 0.5' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.sendCrypto).not.toHaveBeenCalled();
        expect(result).toContain('Error: Send command requires amount and recipient address');
      });
    });

    describe('invalid commands', () => {
      it('should return help message for unknown command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'unknown' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
        expect(paymentService.sendCrypto).not.toHaveBeenCalled();
        expect(result).toContain('<Response><Message>');
        expect(result).toContain('Error: Unknown command: unknown');
        expect(result).toContain('Available Commands:');
        expect(result).toContain('</Message></Response>');
      });

      it('should return help message for empty command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: '' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
        expect(paymentService.sendCrypto).not.toHaveBeenCalled();
        expect(result).toContain('Error: Unknown command:');
      });

      it('should handle whitespace-only messages', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: '   ' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(result).toContain('Error: Unknown command:');
      });
    });

    describe('TwiML response formatting', () => {
      it('should properly escape XML special characters in responses', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create 50 <test>&"description"' };
        const paymentWithSpecialChars = { 
          ...mockPaymentEntity, 
          description: '<test>&"description"' 
        };
        paymentService.createPaymentRequest.mockResolvedValue(paymentWithSpecialChars);
        paymentService.generatePaymentLink.mockReturnValue('http://localhost:3000/payment/test-payment-id');

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(result).toContain('&lt;test&gt;&amp;&quot;description&quot;');
        expect(result).not.toContain('<test>&"description"');
      });

      it('should format valid TwiML structure', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'help' };

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(result).toMatch(/^<Response><Message>[\s\S]*<\/Message><\/Response>$/);
      });
    });

    describe('case sensitivity', () => {
      it('should handle uppercase CREATE command', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'CREATE 50 coffee' };
        paymentService.createPaymentRequest.mockResolvedValue(mockPaymentEntity);
        paymentService.generatePaymentLink.mockReturnValue('http://localhost:3000/payment/test-payment-id');

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).toHaveBeenCalledWith('webhook-system', {
          amount: 50,
          description: 'coffee',
        });
        expect(result).toContain('Payment Created');
      });

      it('should handle mixed case commands', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'CrEaTe 25.50 Mixed Case Description' };
        paymentService.createPaymentRequest.mockResolvedValue({
          ...mockPaymentEntity,
          amount: 25.50,
          description: 'Mixed Case Description'
        });
        paymentService.generatePaymentLink.mockReturnValue('http://localhost:3000/payment/test-payment-id');

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).toHaveBeenCalledWith('webhook-system', {
          amount: 25.50,
          description: 'Mixed Case Description',
        });
      });
    });

    describe('decimal amounts', () => {
      it('should handle decimal amounts correctly', async () => {
        // Arrange
        const webhookDto = { ...mockWhatsAppWebhookDto, Body: 'create 25.99 decimal test' };
        const decimalPayment = { ...mockPaymentEntity, amount: 25.99 };
        paymentService.createPaymentRequest.mockResolvedValue(decimalPayment);
        paymentService.generatePaymentLink.mockReturnValue('http://localhost:3000/payment/test-payment-id');

        // Act
        const result = await controller.handleWhatsAppWebhook(webhookDto);

        // Assert
        expect(paymentService.createPaymentRequest).toHaveBeenCalledWith('webhook-system', {
          amount: 25.99,
          description: 'decimal test',
        });
        expect(result).toContain('Amount: 25.99');
      });
    });
  });
});