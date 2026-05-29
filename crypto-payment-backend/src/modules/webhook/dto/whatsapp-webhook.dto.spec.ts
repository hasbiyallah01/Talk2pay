import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { WhatsAppWebhookDto } from './whatsapp-webhook.dto';

describe('WhatsAppWebhookDto', () => {
  describe('Valid payloads', () => {
    it('should validate a complete valid Twilio WhatsApp webhook payload', async () => {
      const validPayload = {
        Body: 'create 50 Coffee payment',
        From: 'whatsapp:+1234567890',
        To: 'whatsapp:+14155238886',
        MessageSid: 'SM1234567890abcdef1234567890abcdef',
        AccountSid: 'AC1234567890abcdef1234567890abcdef',
        MessagingServiceSid: 'MG1234567890abcdef1234567890abcdef',
        NumMedia: '0',
        ProfileName: 'John Doe',
        WaId: 'whatsapp:+1234567890',
        ExternalUserId: '1234567890',
        SmsMessageSid: 'SM1234567890abcdef1234567890abcdef',
        MessageType: 'text',
        SmsSid: 'SM1234567890abcdef1234567890abcdef',
        SmsStatus: 'received',
        NumSegments: '1',
        ReferralNumMedia: '0',
        ChannelMetadata: '{}',
        ApiVersion: '2010-04-01'
      };

      const dto = plainToClass(WhatsAppWebhookDto, validPayload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.Body).toBe(validPayload.Body);
      expect(dto.From).toBe(validPayload.From);
      expect(dto.To).toBe(validPayload.To);
      expect(dto.MessageSid).toBe(validPayload.MessageSid);
      expect(dto.AccountSid).toBe(validPayload.AccountSid);
      expect(dto.MessagingServiceSid).toBe(validPayload.MessagingServiceSid);
      expect(dto.NumMedia).toBe(validPayload.NumMedia);
      expect(dto.ProfileName).toBe(validPayload.ProfileName);
      expect(dto.WaId).toBe(validPayload.WaId);
      expect(dto.ExternalUserId).toBe(validPayload.ExternalUserId);
      expect(dto.SmsMessageSid).toBe(validPayload.SmsMessageSid);
      expect(dto.MessageType).toBe(validPayload.MessageType);
      expect(dto.SmsSid).toBe(validPayload.SmsSid);
      expect(dto.SmsStatus).toBe(validPayload.SmsStatus);
      expect(dto.NumSegments).toBe(validPayload.NumSegments);
      expect(dto.ReferralNumMedia).toBe(validPayload.ReferralNumMedia);
      expect(dto.ChannelMetadata).toBe(validPayload.ChannelMetadata);
      expect(dto.ApiVersion).toBe(validPayload.ApiVersion);
    });

    it('should validate a minimal valid Twilio WhatsApp webhook payload', async () => {
      const minimalPayload = {
        Body: 'help',
        From: 'whatsapp:+1234567890',
        To: 'whatsapp:+14155238886',
        MessageSid: 'SM1234567890abcdef1234567890abcdef'
      };

      const dto = plainToClass(WhatsAppWebhookDto, minimalPayload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.Body).toBe(minimalPayload.Body);
      expect(dto.From).toBe(minimalPayload.From);
      expect(dto.To).toBe(minimalPayload.To);
      expect(dto.MessageSid).toBe(minimalPayload.MessageSid);
    });

    it('should validate different valid phone number formats', async () => {
      const testCases = [
        'whatsapp:+1234567890',      // 10 digits
        'whatsapp:+123456789012',    // 12 digits
        'whatsapp:+123456789012345', // 15 digits (max)
      ];

      for (const phoneNumber of testCases) {
        const payload = {
          Body: 'test message',
          From: phoneNumber,
          To: phoneNumber,
          MessageSid: 'SM1234567890abcdef1234567890abcdef'
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid MessageSid formats', async () => {
      const testCases = [
        'SM1234567890abcdef1234567890abcdef',
        'SMabcdef1234567890abcdef1234567890',
        'SM00000000000000000000000000000000',
        'SMffffffffffffffffffffffffffffffff',
        'SMABCDEF1234567890ABCDEF1234567890'
      ];

      for (const messageSid of testCases) {
        const payload = {
          Body: 'test message',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          MessageSid: messageSid
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid AccountSid formats', async () => {
      const testCases = [
        'AC1234567890abcdef1234567890abcdef',
        'ACabcdef1234567890abcdef1234567890',
        'AC00000000000000000000000000000000',
        'ACABCDEF1234567890ABCDEF1234567890'
      ];

      for (const accountSid of testCases) {
        const payload = {
          Body: 'test message',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          MessageSid: 'SM1234567890abcdef1234567890abcdef',
          AccountSid: accountSid
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should validate different valid NumMedia values', async () => {
      const testCases = ['0', '1', '5', '10'];

      for (const numMedia of testCases) {
        const payload = {
          Body: 'test message',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          MessageSid: 'SM1234567890abcdef1234567890abcdef',
          NumMedia: numMedia
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('Invalid payloads', () => {
    describe('Body validation', () => {
      it('should fail validation when Body is missing', async () => {
        const payload = {
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          MessageSid: 'SM1234567890abcdef1234567890abcdef'
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('Body');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        expect(errors[0].constraints.isNotEmpty).toBe('Body is required');
      });

      it('should fail validation when Body is empty string', async () => {
        const payload = {
          Body: '',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          MessageSid: 'SM1234567890abcdef1234567890abcdef'
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('Body');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation when Body is not a string', async () => {
        const payload = {
          Body: 123,
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          MessageSid: 'SM1234567890abcdef1234567890abcdef'
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('Body');
        expect(errors[0].constraints).toHaveProperty('isString');
        expect(errors[0].constraints.isString).toBe('Body must be a string');
      });
    });

    describe('From validation', () => {
      it('should fail validation when From is missing', async () => {
        const payload = {
          Body: 'test message',
          To: 'whatsapp:+14155238886',
          MessageSid: 'SM1234567890abcdef1234567890abcdef'
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('From');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation when From has invalid format', async () => {
        const invalidFormats = [
          '+1234567890',           // Missing whatsapp: prefix
          'whatsapp:1234567890',   // Missing + sign
          'whatsapp:+123',         // Too short
          'whatsapp:+1234567890123456', // Too long
          'whatsapp:+123abc7890',  // Contains letters
          'telegram:+1234567890',  // Wrong service
          'whatsapp: +1234567890', // Space after colon
        ];

        for (const invalidFrom of invalidFormats) {
          const payload = {
            Body: 'test message',
            From: invalidFrom,
            To: 'whatsapp:+14155238886',
            MessageSid: 'SM1234567890abcdef1234567890abcdef'
          };

          const dto = plainToClass(WhatsAppWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const fromError = errors.find(error => error.property === 'From');
          expect(fromError).toBeDefined();
          expect(fromError.constraints).toHaveProperty('matches');
        }
      });
    });

    describe('To validation', () => {
      it('should fail validation when To is missing', async () => {
        const payload = {
          Body: 'test message',
          From: 'whatsapp:+1234567890',
          MessageSid: 'SM1234567890abcdef1234567890abcdef'
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('To');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation when To has invalid format', async () => {
        const invalidFormats = [
          '+14155238886',           // Missing whatsapp: prefix
          'whatsapp:14155238886',   // Missing + sign
          'whatsapp:+141',          // Too short
          'whatsapp:+1415523886612345678', // Too long
        ];

        for (const invalidTo of invalidFormats) {
          const payload = {
            Body: 'test message',
            From: 'whatsapp:+1234567890',
            To: invalidTo,
            MessageSid: 'SM1234567890abcdef1234567890abcdef'
          };

          const dto = plainToClass(WhatsAppWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const toError = errors.find(error => error.property === 'To');
          expect(toError).toBeDefined();
          expect(toError.constraints).toHaveProperty('matches');
        }
      });
    });

    describe('MessageSid validation', () => {
      it('should fail validation when MessageSid is missing', async () => {
        const payload = {
          Body: 'test message',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886'
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('MessageSid');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
      });

      it('should fail validation when MessageSid has invalid format', async () => {
        const invalidFormats = [
          'AC1234567890abcdef1234567890abcdef', // Wrong prefix (AC instead of SM)
          'SM123',                              // Too short
          'SM1234567890abcdef1234567890abcdef12', // Too long
          'SM1234567890abcdefg234567890abcdef', // Contains invalid character 'g'
          'sm1234567890abcdef1234567890abcdef', // Lowercase prefix
        ];

        for (const invalidMessageSid of invalidFormats) {
          const payload = {
            Body: 'test message',
            From: 'whatsapp:+1234567890',
            To: 'whatsapp:+14155238886',
            MessageSid: invalidMessageSid
          };

          const dto = plainToClass(WhatsAppWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const messageSidError = errors.find(error => error.property === 'MessageSid');
          expect(messageSidError).toBeDefined();
          expect(messageSidError.constraints).toHaveProperty('matches');
        }
      });
    });

    describe('Optional field validation', () => {
      it('should fail validation when AccountSid has invalid format', async () => {
        const invalidFormats = [
          'SM1234567890abcdef1234567890abcdef', // Wrong prefix (SM instead of AC)
          'AC123',                              // Too short
          'AC1234567890abcdef1234567890abcdef12', // Too long
        ];

        for (const invalidAccountSid of invalidFormats) {
          const payload = {
            Body: 'test message',
            From: 'whatsapp:+1234567890',
            To: 'whatsapp:+14155238886',
            MessageSid: 'SM1234567890abcdef1234567890abcdef',
            AccountSid: invalidAccountSid
          };

          const dto = plainToClass(WhatsAppWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const accountSidError = errors.find(error => error.property === 'AccountSid');
          expect(accountSidError).toBeDefined();
          expect(accountSidError.constraints).toHaveProperty('matches');
        }
      });

      it('should fail validation when NumMedia is not numeric', async () => {
        const invalidFormats = ['abc', '1.5', '-1', '1a', 'a1'];

        for (const invalidNumMedia of invalidFormats) {
          const payload = {
            Body: 'test message',
            From: 'whatsapp:+1234567890',
            To: 'whatsapp:+14155238886',
            MessageSid: 'SM1234567890abcdef1234567890abcdef',
            NumMedia: invalidNumMedia
          };

          const dto = plainToClass(WhatsAppWebhookDto, payload);
          const errors = await validate(dto);

          expect(errors.length).toBeGreaterThan(0);
          const numMediaError = errors.find(error => error.property === 'NumMedia');
          expect(numMediaError).toBeDefined();
          expect(numMediaError.constraints).toHaveProperty('matches');
        }
      });

      it('should fail validation when optional string fields are not strings', async () => {
        const payload = {
          Body: 'test message',
          From: 'whatsapp:+1234567890',
          To: 'whatsapp:+14155238886',
          MessageSid: 'SM1234567890abcdef1234567890abcdef',
          MessagingServiceSid: 123, // Should be string
          ProfileName: 456,         // Should be string
          WaId: 789                 // Should be string
        };

        const dto = plainToClass(WhatsAppWebhookDto, payload);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(3);
        
        const messagingServiceSidError = errors.find(error => error.property === 'MessagingServiceSid');
        expect(messagingServiceSidError).toBeDefined();
        expect(messagingServiceSidError.constraints).toHaveProperty('isString');

        const profileNameError = errors.find(error => error.property === 'ProfileName');
        expect(profileNameError).toBeDefined();
        expect(profileNameError.constraints).toHaveProperty('isString');

        const waIdError = errors.find(error => error.property === 'WaId');
        expect(waIdError).toBeDefined();
        expect(waIdError.constraints).toHaveProperty('isString');
      });
    });
  });

  describe('Real-world Twilio webhook examples', () => {
    it('should validate actual Twilio WhatsApp webhook payload', async () => {
      // This is based on actual Twilio webhook documentation
      const realPayload = {
        AccountSid: 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        Body: 'create 25.50 Lunch order',
        From: 'whatsapp:+15551234567',
        MessageSid: 'SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        NumMedia: '0',
        ProfileName: 'Jane Smith',
        To: 'whatsapp:+14155238886',
        WaId: '15551234567'
      };

      const dto = plainToClass(WhatsAppWebhookDto, realPayload);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate Twilio webhook with media attachment', async () => {
      const payloadWithMedia = {
        AccountSid: 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        Body: 'Check this image',
        From: 'whatsapp:+15551234567',
        MessageSid: 'SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        NumMedia: '1',
        ProfileName: 'John Doe',
        To: 'whatsapp:+14155238886',
        WaId: '15551234567'
      };

      const dto = plainToClass(WhatsAppWebhookDto, payloadWithMedia);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should validate empty message body (valid in WhatsApp)', async () => {
      const payloadWithEmptyBody = {
        AccountSid: 'ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        Body: ' ', // Single space is valid
        From: 'whatsapp:+15551234567',
        MessageSid: 'SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        NumMedia: '0',
        To: 'whatsapp:+14155238886'
      };

      const dto = plainToClass(WhatsAppWebhookDto, payloadWithEmptyBody);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});