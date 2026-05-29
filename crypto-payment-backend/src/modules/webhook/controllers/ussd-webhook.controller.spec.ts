import { Test, TestingModule } from '@nestjs/testing';
import { USSDWebhookController } from './ussd-webhook.controller';
import { PaymentService } from '../../payment/payment.service';
import { USSDWebhookDto } from '../dto/ussd-webhook.dto';
import { PaymentEntity } from '../../../entities/payment.entity';
import { MerchantEntity } from '../../../entities//merchant.entity';
import { PaymentStatus } from '../../../common/enums/payment-status.enum';
import { Logger } from '@nestjs/common';

describe('USSDWebhookController', () => {
  let controller: USSDWebhookController;
  let paymentService: jest.Mocked<PaymentService>;

  const mockPaymentService = {
    createPaymentRequest: jest.fn(),
    generatePaymentLink: jest.fn(),
  };

  const mockPayment: PaymentEntity = {
    id: 'test-payment-id',
    merchantId: 'webhook-system',
    amount: 50,
    description: 'USSD Payment from +254712345678',
    status: PaymentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    merchant: {
      id: 'webhook-system',
      phoneNumber: '+23465789567',
      businessName: 'Test Business',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as MerchantEntity,
  };

  const createMockWebhookDto = (text: string = ''): USSDWebhookDto => ({
    sessionId: 'ATUid_12345678901234567890123456789012',
    serviceCode: '*384*1234#',
    phoneNumber: '+254712345678',
    text,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [USSDWebhookController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<USSDWebhookController>(USSDWebhookController);
    paymentService = module.get(PaymentService);

    // Mock Logger to avoid console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUSSDWebhook', () => {
    describe('Initial request (empty text)', () => {
      it('should return main menu for initial request', async () => {
        const webhookDto = createMockWebhookDto('');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('CON Welcome to Payment Service\n1. Create Payment\n2. Exit');
      });
    });

    describe('Menu navigation', () => {
      it('should return amount prompt when user selects option 1', async () => {
        const webhookDto = createMockWebhookDto('1');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('CON Enter payment amount:\n(e.g., 50 for ₿50)');
      });

      it('should return goodbye message when user selects option 2', async () => {
        const webhookDto = createMockWebhookDto('2');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('END Thank you for using our payment service. Goodbye!');
      });

      it('should return invalid input message for unknown menu option', async () => {
        const webhookDto = createMockWebhookDto('3');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('CON Invalid option. Please try again.\n1. Create Payment\n2. Exit');
      });
    });

    describe('Payment creation flow', () => {
      it('should create payment successfully with valid amount', async () => {
        const webhookDto = createMockWebhookDto('1*50');
        const expectedPaymentLink = 'http://localhost:3000/payment/test-payment-id';

        paymentService.createPaymentRequest.mockResolvedValue(mockPayment);
        paymentService.generatePaymentLink.mockReturnValue(expectedPaymentLink);

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(paymentService.createPaymentRequest).toHaveBeenCalledWith(
          'webhook-system',
          {
            amount: 50,
            description: 'USSD Payment from +254712345678',
          }
        );
        expect(paymentService.generatePaymentLink).toHaveBeenCalledWith(
          'test-payment-id',
          'http://localhost:3000'
        );
        expect(result).toBe('END Payment Created Successfully!\nAmount: ₿50.00\nLink: http://localhost:3000/payment/test-payment-id');
      });

      it('should create payment with decimal amount', async () => {
        const webhookDto = createMockWebhookDto('1*25.50');
        const expectedPaymentLink = 'http://localhost:3000/payment/test-payment-id';

        const mockPaymentWithDecimal = { ...mockPayment, amount: 25.50 };
        paymentService.createPaymentRequest.mockResolvedValue(mockPaymentWithDecimal);
        paymentService.generatePaymentLink.mockReturnValue(expectedPaymentLink);

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(paymentService.createPaymentRequest).toHaveBeenCalledWith(
          'webhook-system',
          {
            amount: 25.50,
            description: 'USSD Payment from +254712345678',
          }
        );
        expect(result).toBe('END Payment Created Successfully!\nAmount: ₿25.50\nLink: http://localhost:3000/payment/test-payment-id');
      });

      it('should handle invalid amount format', async () => {
        const webhookDto = createMockWebhookDto('1*invalid');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('CON Invalid amount. Please enter a valid number:\n(e.g., 50 for ₿50)');
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
      });

      it('should handle negative amount', async () => {
        const webhookDto = createMockWebhookDto('1*-10');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('CON Invalid amount. Please enter a valid number:\n(e.g., 50 for ₿50)');
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
      });

      it('should handle zero amount', async () => {
        const webhookDto = createMockWebhookDto('1*0');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('CON Invalid amount. Please enter a valid number:\n(e.g., 50 for ₿50)');
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
      });

      it('should handle malformed payment input', async () => {
        const webhookDto = createMockWebhookDto('1*50*extra');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('CON Invalid amount. Please enter a valid number:\n(e.g., 50 for ₿50)');
        expect(paymentService.createPaymentRequest).not.toHaveBeenCalled();
      });
    });

    describe('Error handling', () => {
      it('should handle PaymentService errors gracefully', async () => {
        const webhookDto = createMockWebhookDto('1*50');

        paymentService.createPaymentRequest.mockRejectedValue(new Error('Database connection failed'));

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('END Payment creation failed. Please try again later.');
        expect(Logger.prototype.error).toHaveBeenCalledWith(
          'Error creating payment: Database connection failed',
          expect.any(String)
        );
      });

      it('should handle unexpected errors in main flow', async () => {
        const webhookDto = createMockWebhookDto('1');

        // Mock an unexpected error by making the controller throw
        jest.spyOn(controller as any, 'getAmountPrompt').mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toBe('END Payment creation failed. Please try again later.');
        expect(Logger.prototype.error).toHaveBeenCalledWith(
          'Error processing USSD webhook: Unexpected error',
          expect.any(String)
        );
      });
    });

    describe('Response formatting', () => {
      it('should format CON responses correctly', async () => {
        const webhookDto = createMockWebhookDto('1');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toMatch(/^CON /);
        expect(result).toContain('Enter payment amount:');
      });

      it('should format END responses correctly', async () => {
        const webhookDto = createMockWebhookDto('2');

        const result = await controller.handleUSSDWebhook(webhookDto);

        expect(result).toMatch(/^END /);
        expect(result).toContain('Thank you for using our payment service');
      });
    });

    describe('Environment configuration', () => {
      it('should use custom BASE_URL when provided', async () => {
        const originalEnv = process.env.BASE_URL;
        process.env.BASE_URL = 'https://custom-domain.com';

        // Recreate controller to pick up new environment variable
        const module: TestingModule = await Test.createTestingModule({
          controllers: [USSDWebhookController],
          providers: [
            {
              provide: PaymentService,
              useValue: mockPaymentService,
            },
          ],
        }).compile();

        const customController = module.get<USSDWebhookController>(USSDWebhookController);

        const webhookDto = createMockWebhookDto('1*50');
        const expectedPaymentLink = 'https://custom-domain.com/payment/test-payment-id';

        paymentService.createPaymentRequest.mockResolvedValue(mockPayment);
        paymentService.generatePaymentLink.mockReturnValue(expectedPaymentLink);

        const result = await customController.handleUSSDWebhook(webhookDto);

        expect(paymentService.generatePaymentLink).toHaveBeenCalledWith(
          'test-payment-id',
          'https://custom-domain.com'
        );
        expect(result).toContain('https://custom-domain.com/payment/test-payment-id');

        // Restore original environment
        process.env.BASE_URL = originalEnv;
      });
    });

    describe('Logging', () => {
      it('should log incoming webhook requests', async () => {
        const webhookDto = createMockWebhookDto('1');

        await controller.handleUSSDWebhook(webhookDto);

        expect(Logger.prototype.log).toHaveBeenCalledWith(
          'USSD webhook received from +254712345678, text: "1"'
        );
      });

      it('should log empty text for initial requests', async () => {
        const webhookDto = createMockWebhookDto('');

        await controller.handleUSSDWebhook(webhookDto);

        expect(Logger.prototype.log).toHaveBeenCalledWith(
          'USSD webhook received from +254712345678, text: ""'
        );
      });
    });
  });
});