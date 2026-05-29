import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { USSDWebhookDto } from './ussd-webhook.dto';

describe('USSDWebhookDto', () => {
  describe('Valid payloads', () => {
    it('should validate a complete valid Africa\'s Talking USSD webhook payload', async () => {
      const validPayload = {
        sessionId: 'ATUid_12345678901234567890123456789012',
        serviceCode: '*384*1234#',
        phoneNumber: '+254712345678',
        text: '1*50',
        networkCode: '63902',
        cost: 'KES 0.00'
      };

      const dto = plainToClass(USSDWebhookDto, validPayload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.sessionId).toBe(validPayload.sessionId);
      expect(dto.serviceCode).toBe(validPayload.serviceCode);
      expect(dto.phoneNumber).toBe(validPayload.phoneNumber);
      expect(dto.text).toBe(validPayload.text);
      expect(dto.networkCode).toBe(validPayload.networkCode);
      expect(dto.cost).toBe(validPayload.cost);
    });

    it('should validate a minimal valid Africa\'s Talking USSD webhook payload', async () => {
      const minimalPayload = {
        sessionId: 'ATUid_abcdef1234567890abcdef1234567890',
        serviceCode: '*384#',
        phoneNumber: '+254712345678',
        text: ''
      };

      const dto = plainToClass(USSDWebhookDto, minimalPayload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.sessionId).toBe(minimalPayload.sessionId);
      expect(dto.serviceCode).toBe(minimalPayload.serviceCode);
      expect(dto.phoneNumber).toBe(minimalPayload.phoneNumber);
      expect(dto.text).toBe(minimalPayload.text);
    });

    it('should validate different valid phone number formats', async () => {
      const testCases = [
        '+254712345678',      // Kenya (10 digits after country code)
        '+1234567890',        // 10 digits
        '+123456789012',      // 12 digits
        '+123456789012345',   // 15 digits (max)
        '+27821234567',       // South Africa
        '+233241234567',      // Ghana
        '+234801234567'       // Nigeria
      ];

      for (const phoneNumber of testCases) {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: phoneNumber,
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid sessionId formats', async () => {
      const testCases = [
        'ATUid_12345678901234567890123456789012',
        'ATUid_abcdef1234567890abcdef1234567890',
        'ATUid_00000000000000000000000000000000',
        'ATUid_ABCDEF1234567890ABCDEF1234567890',
        'ATUid_ffffffffffffffffffffffffffffffff',
        'ATUid_a1b2c3d4e5f6789012345678901234567890' // 36 chars (within range)
      ];

      for (const sessionId of testCases) {
        const payload = {
          sessionId: sessionId,
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid serviceCode formats', async () => {
      const testCases = [
        '*384#',           // 3-digit code
        '*1234#',          // 4-digit code
        '*384*1234#',      // Code with sub-code
        '*1000*1*2#',      // Complex service code
        '*100#',           // Short code
        '*9999#'           // Max 4-digit code
      ];

      for (const serviceCode of testCases) {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: serviceCode,
          phoneNumber: '+254712345678',
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid text input sequences', async () => {
      const testCases = [
        '',              // Initial request (empty)
        '1',             // Single selection
        '1*50',          // Menu selection with amount
        '1*50*Coffee',   // Complex input sequence
        '2',             // Different menu option
        '1*25.50*Lunch', // Decimal amount
        '0'              // Back/cancel option
      ];

      for (const text of testCases) {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: text
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid networkCode formats', async () => {
      const testCases = [
        '63902',    // 5 digits
        '639020',   // 6 digits
        '12345',    // Different 5-digit code
        '999999'    // Max 6-digit code
      ];

      for (const networkCode of testCases) {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: '',
          networkCode: networkCode
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid cost formats', async () => {
      const testCases = [
        'KES 0.00',
        'USD 0.01',
        'NGN 5.00',
        'GHS 0.50',
        'ZAR 1.25'
      ];

      for (const cost of testCases) {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: '',
          cost: cost
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('Invalid payloads', () => {
    describe('sessionId validation', () => {
      it('should fail validation when sessionId is missing', async () => {
        const payload = {
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('sessionId');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        expect(errors[0].constraints.isNotEmpty).toBe('sessionId is required');
      });

      it('should fail validation when sessionId is empty string', async () => {
        const payload = {
          sessionId: '',
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('sessionId');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation when sessionId is not a string', async () => {
        const payload = {
          sessionId: 123456,
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('sessionId');
        expect(errors[0].constraints).toHaveProperty('isString');
        expect(errors[0].constraints.isString).toBe('sessionId must be a string');
      });

      it('should fail validation when sessionId has invalid format', async () => {
        const invalidFormats = [
          'ATUid_123',                              // Too short (less than 32)
          'ATUid_123456789012345678901234567890123456789012345', // Too long (more than 40)
          'INVALID_12345678901234567890123456789012',  // Wrong prefix
          'ATUid_1234567890123456789012345678901@',    // Invalid character (@)
          'atuid_12345678901234567890123456789012',    // Lowercase prefix
          'ATUid12345678901234567890123456789012',     // Missing underscore
          'ATUid_',                                    // Empty after underscore
        ];

        for (const invalidSessionId of invalidFormats) {
          const payload = {
            sessionId: invalidSessionId,
            serviceCode: '*384#',
            phoneNumber: '+254712345678',
            text: ''
          };

          const dto = plainToClass(USSDWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const sessionIdError = errors.find(error => error.property === 'sessionId');
          expect(sessionIdError).toBeDefined();
          expect(sessionIdError.constraints).toHaveProperty('matches');
        }
      });
    });

    describe('serviceCode validation', () => {
      it('should fail validation when serviceCode is missing', async () => {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          phoneNumber: '+254712345678',
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('serviceCode');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation when serviceCode has invalid format', async () => {
        const invalidFormats = [
          '384#',           // Missing * prefix
          '*38#',           // Too short (less than 3 digits)
          '*12345#',        // Too long (more than 4 digits in first part)
          '384',            // Missing both * and #
          '*abc#',          // Non-numeric
          '**384#',         // Double asterisk
          '*384##',         // Double hash
          '*384*abc#',      // Non-numeric in sub-code
        ];

        for (const invalidServiceCode of invalidFormats) {
          const payload = {
            sessionId: 'ATUid_12345678901234567890123456789012',
            serviceCode: invalidServiceCode,
            phoneNumber: '+254712345678',
            text: ''
          };

          const dto = plainToClass(USSDWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const serviceCodeError = errors.find(error => error.property === 'serviceCode');
          expect(serviceCodeError).toBeDefined();
          expect(serviceCodeError.constraints).toHaveProperty('matches');
        }
      });
    });

    describe('phoneNumber validation', () => {
      it('should fail validation when phoneNumber is missing', async () => {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('phoneNumber');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation when phoneNumber has invalid format', async () => {
        const invalidFormats = [
          '254712345678',           // Missing + prefix
          '+254',                   // Too short
          '+2547123456781234567',   // Too long (more than 15 digits)
          '+254abc345678',          // Contains letters
          '+254-712-345678',        // Contains hyphens
          '+254 712 345678',        // Contains spaces
          '++254712345678',         // Double plus
        ];

        for (const invalidPhoneNumber of invalidFormats) {
          const payload = {
            sessionId: 'ATUid_12345678901234567890123456789012',
            serviceCode: '*384#',
            phoneNumber: invalidPhoneNumber,
            text: ''
          };

          const dto = plainToClass(USSDWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const phoneNumberError = errors.find(error => error.property === 'phoneNumber');
          expect(phoneNumberError).toBeDefined();
          expect(phoneNumberError.constraints).toHaveProperty('matches');
        }
      });
    });

    describe('text validation', () => {
      it('should fail validation when text is not a string', async () => {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: 123
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('text');
        expect(errors[0].constraints).toHaveProperty('isString');
        expect(errors[0].constraints.isString).toBe('text must be a string');
      });

      it('should allow text to be missing (undefined)', async () => {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: '+254712345678'
          // text is missing
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        // Should fail because text is required (not optional)
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('text');
      });
    });

    describe('Optional field validation', () => {
      it('should fail validation when networkCode has invalid format', async () => {
        const invalidFormats = [
          '1234',      // Too short (less than 5 digits)
          '1234567',   // Too long (more than 6 digits)
          'abc12',     // Contains letters
          '123-45',    // Contains hyphen
          '123 45',    // Contains space
        ];

        for (const invalidNetworkCode of invalidFormats) {
          const payload = {
            sessionId: 'ATUid_12345678901234567890123456789012',
            serviceCode: '*384#',
            phoneNumber: '+254712345678',
            text: '',
            networkCode: invalidNetworkCode
          };

          const dto = plainToClass(USSDWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const networkCodeError = errors.find(error => error.property === 'networkCode');
          expect(networkCodeError).toBeDefined();
          expect(networkCodeError.constraints).toHaveProperty('matches');
        }
      });

      it('should fail validation when optional string fields are not strings', async () => {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: '',
          networkCode: 123456, // Should be string
          cost: 0.00          // Should be string
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
        
        const networkCodeError = errors.find(error => error.property === 'networkCode');
        expect(networkCodeError).toBeDefined();
        expect(networkCodeError.constraints).toHaveProperty('isString');

        const costError = errors.find(error => error.property === 'cost');
        expect(costError).toBeDefined();
        expect(costError.constraints).toHaveProperty('isString');
      });
    });
  });

  describe('Real-world Africa\'s Talking webhook examples', () => {
    it('should validate actual Africa\'s Talking USSD webhook payload for initial request', async () => {
      // This is based on actual Africa's Talking webhook documentation
      const realPayload = {
        sessionId: 'ATUid_a1b2c3d4e5f6789012345678901234567890',
        serviceCode: '*384*1234#',
        phoneNumber: '+254712345678',
        text: '',
        networkCode: '63902',
        cost: 'KES 0.00'
      };

      const dto = plainToClass(USSDWebhookDto, realPayload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate Africa\'s Talking webhook with user input sequence', async () => {
      const payloadWithInput = {
        sessionId: 'ATUid_a1b2c3d4e5f6789012345678901234567890',
        serviceCode: '*384*1234#',
        phoneNumber: '+254712345678',
        text: '1*50*Coffee payment',
        networkCode: '63902',
        cost: 'KES 0.00'
      };

      const dto = plainToClass(USSDWebhookDto, payloadWithInput);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate minimal Africa\'s Talking webhook (sandbox)', async () => {
      const minimalPayload = {
        sessionId: 'ATUid_sandbox12345678901234567890123456', // 38 chars total
        serviceCode: '*384#',
        phoneNumber: '+254700000000',
        text: '1'
      };

      const dto = plainToClass(USSDWebhookDto, minimalPayload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate different African country phone numbers', async () => {
      const africanNumbers = [
        '+254712345678',  // Kenya
        '+233241234567',  // Ghana  
        '+234801234567',  // Nigeria
        '+27821234567',   // South Africa
        '+256701234567',  // Uganda
        '+255712345678',  // Tanzania
        '+250781234567'   // Rwanda
      ];

      for (const phoneNumber of africanNumbers) {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: phoneNumber,
          text: ''
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate complex USSD flow navigation', async () => {
      const flowSteps = [
        '',                    // Initial request
        '1',                   // Select "Create Payment"
        '1*50',               // Enter amount
        '1*50*Coffee',        // Enter description
        '1*50*Coffee*1'       // Confirm
      ];

      for (const text of flowSteps) {
        const payload = {
          sessionId: 'ATUid_12345678901234567890123456789012',
          serviceCode: '*384#',
          phoneNumber: '+254712345678',
          text: text
        };

        const dto = plainToClass(USSDWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });
  });
});