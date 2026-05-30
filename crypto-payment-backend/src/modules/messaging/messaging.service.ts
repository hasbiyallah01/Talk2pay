import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { WhatsAppWalletService } from './whatsapp-wallet.service';

export interface CommandResponse {
  message: string;
  isError: boolean;
  requiresInput?: boolean;
  nextStep?: string;
  deleteMessage?: boolean; // For security-sensitive messages
}

@Injectable()
export class MessagingService {
  private readonly availableCommands = [
    'setup - Create your crypto wallet',
    'about - Learn about Talk2Pay',
    'help - Show available commands',
    'balance - Check wallet balance',
    'fund - Add money to wallet',
    'send - Send crypto to someone',
    'receive - Generate payment link',
    'payments - View recent payments',
    'history - View transaction history',
    'settings - Update preferences',
    'support - Contact support',
    'qr - Generate QR code for payments'
  ];

  // Track users in PIN creation flow
  private pinCreationFlow = new Map<string, { step: string; timestamp: number }>();
  
  // Track users in funding flow
  private fundingFlow = new Map<string, { step: string; timestamp: number }>();

  constructor(
    private readonly authService: AuthService,
    private readonly whatsappWalletService: WhatsAppWalletService,
  ) {}

  async handleWhatsAppMessage(phoneNumber: string, message: string): Promise<CommandResponse> {
    return this.processCommand(phoneNumber, message, 'whatsapp');
  }

  async handleUssdMessage(phoneNumber: string, message: string): Promise<CommandResponse> {
    return this.processCommand(phoneNumber, message, 'ussd');
  }

  private async processCommand(
    phoneNumber: string, 
    message: string, 
    channel: 'whatsapp' | 'ussd'
  ): Promise<CommandResponse> {
    try {
      const command = message.toLowerCase().trim();

      // Check if user is in PIN creation flow
      const pinFlow = this.pinCreationFlow.get(phoneNumber);
      console.log(`PIN flow check for ${phoneNumber}:`, pinFlow);
      
      if (pinFlow && pinFlow.step === 'create_pin') {
        console.log(`Processing PIN creation for ${phoneNumber}`);
        // Handle PIN creation
        const result = await this.whatsappWalletService.createPin(phoneNumber, message.trim());
        
        console.log(`PIN creation result:`, result);
        
        if (!result.isError) {
          // Clear PIN flow on success
          this.pinCreationFlow.delete(phoneNumber);
        }
        
        return {
          ...result,
          deleteMessage: true // Delete the PIN message for security
        };
      }

      // Check if user is in funding flow
      const fundingFlowState = this.fundingFlow.get(phoneNumber);
      if (fundingFlowState && fundingFlowState.step === 'funding_method') {
        return this.handleFundingMethodSelection(phoneNumber, message.trim());
      }

      // Handle wallet setup commands first (before checking if merchant exists)
      if (command.startsWith('setup') || command === 'start' || command === 'create wallet') {
        console.log(`Setup command detected: "${command}" for phone: ${phoneNumber}`);
        
        // Extract first name from message or ask for it
        const words = message.split(' ');
        let firstName = 'Friend'; // Default
        
        if (words.length > 1) {
          firstName = words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase();
        }
        
        console.log(`Extracted firstName: ${firstName}`);
        
        const result = await this.whatsappWalletService.setupWallet(phoneNumber, firstName);
        
        console.log(`Setup wallet result:`, result);
        
        if (result.requiresPin) {
          // Track user in PIN creation flow
          this.pinCreationFlow.set(phoneNumber, {
            step: 'create_pin',
            timestamp: Date.now()
          });
        }
        
        return result;
      }

      // Handle company information
      if (command === 'about' || command === 'info' || command === 'what is Talk2Pay') {
        return {
          message: await this.whatsappWalletService.getCompanyInfo(),
          isError: false
        };
      }

      // For all other commands, check if merchant exists
      const merchant = await this.authService.findMerchantByPhoneNumber(phoneNumber);
      
      if (!merchant) {
        return {
          message: `Hello!  Welcome to Talk2Pay!\n\n I see you're new here. Let's get you started!\n\n Talk2Pay lets you:\n• Send & receive crypto instantly\n• Convert crypto to cash\n• Pay bills with cryptocurrency\n• Secure wallet on WhatsApp\n\n Ready to create your wallet?\nType: setup [YourName]\nExample: "setup John"\n\n Want to learn more first? Type 'about'`,
          isError: false
        };
      }

      // Check if wallet setup is complete
      if (!merchant.walletPin && channel === 'whatsapp') {
        return {
          message: `Hello ${merchant.firstName}! \n\nYour account exists but needs a secure PIN for WhatsApp transactions.\n\nType 'setup' to complete your wallet setup with a secure PIN.\n\n This keeps your crypto safe!`,
          isError: false
        };
      }

      const firstName = merchant.firstName;

      // Handle help command
      if (command === 'help') {
        return {
          message: this.formatHelpResponse(firstName, channel),
          isError: false
        };
      }

      // Handle other recognized commands
      switch (command) {
        case 'balance':
          return {
            message: `Hello ${firstName}! \n\nYour current wallet balance: ₿${parseFloat(merchant.walletBalance?.toString() || '0').toFixed(2)}\n\n Quick actions:\n• Type 'fund' to add money\n• Type 'send' to transfer crypto\n• Type 'receive' to request payment\n\n Tip: All transactions require your secure PIN for safety!`,
            isError: false
          };
        
        case 'fund':
        case 'deposit':
        case 'add money':
          // Set user in funding flow
          this.fundingFlow.set(phoneNumber, {
            step: 'funding_method',
            timestamp: Date.now()
          });
          
          return {
            message: `Hello ${firstName}! 💰 Let's add money to your wallet!\n\n🏦 Choose your funding method:\n\n1️⃣ Bank Transfer - Free, 1-2 hours\n2️⃣ Debit Card - 2.5% fee, instant\n3️⃣ Cash Deposit - Free, instant\n4️⃣ Crypto Deposit - Network fees, 30-60 min\n5️⃣ Mobile Money - 1% fee, instant\n\n💡 For instant funding with full features, use our mobile app.\n\n📱 Or tell me the amount: "fund $50 with card"\n\n❓ Need help? Type 'support'`,
            isError: false,
            requiresInput: true,
            nextStep: 'funding_method'
          };
        
        case 'send':
        case 'transfer':
          return {
            message: `Hello ${firstName}! \n\n To send crypto securely:\n\n1️⃣ Tell me the amount and recipient\nExample: "send $50 to +2348012345678"\n\n2️⃣ I'll ask for your secure PIN\n3️⃣ Transaction completed instantly!\n\n You can send to:\n• Phone numbers (if they have Talk2Pay)\n• Crypto wallet addresses\n• Email addresses\n\n What would you like to send?`,
            isError: false,
            requiresInput: true,
            nextStep: 'send_details'
          };
        
        case 'receive':
        case 'request':
          return {
            message: `Hello ${firstName}! \n\n To request payment:\n\n1️⃣ Tell me the amount\nExample: "request $25 for lunch"\n\n2️⃣ I'll create a payment link\n3️⃣ Share the link with anyone\n4️⃣ Get paid instantly!\n\n The link works on:\n• WhatsApp, SMS, Email\n• Any crypto wallet\n• Our mobile app\n\n What amount would you like to request?`,
            isError: false,
            requiresInput: true,
            nextStep: 'payment_request'
          };
        
        case 'payments':
        case 'recent':
          return {
            message: `Hello ${firstName}! \n\n Your recent activity:\n• Last payment: [View in app]\n• Total transactions: [Check dashboard]\n• This week: [Count] transactions\n\n For detailed payment history with dates and amounts, use our mobile app.\n\n Quick checks:\n• Type 'balance' for current wallet\n• Type 'history' for summary`,
            isError: false
          };
        
        case 'history':
        case 'transactions':
          return {
            message: `Hello ${firstName}! \n\n Transaction Summary:\n• Total sent: $[Amount]\n• Total received: $[Amount]\n• This month: [Count] transactions\n• Success rate: 99.9%\n\n📱 For detailed history with:\n• Transaction IDs\n• Exact timestamps\n• Recipient details\n• Fee breakdown\n\nPlease use our mobile app or web dashboard.\n\n💡 Type 'balance' to see current wallet status.`,
            isError: false
          };
        
        case 'qr':
        case 'qrcode':
          return {
            message: `Hello ${firstName}! Generate QR code for payments:\n\nTell me the amount\nExample: "qr $25 for coffee"\n\nI'll create a QR code\nOthers scan to pay you instantly!\n\nQR codes work with:\n• Any crypto wallet\n• Our mobile app\n• Bank apps (for cash conversion)\n\nWhat amount should the QR code be for?`,
            isError: false,
            requiresInput: true,
            nextStep: 'qr_generation'
          };
        
        case 'settings':
        case 'preferences':
          return {
            message: `Hello ${firstName}! ️\n\n Settings you can update:\n\n Security:\n• Change your PIN\n• Enable/disable notifications\n• Set spending limits\n\n Preferences:\n• Default crypto (BTC, ETH, etc.)\n• Auto-convert settings\n• Language preferences\n\n For full settings control, use our mobile app.\n\n Need to change your PIN? Type 'change pin'\n Need help? Type 'support'`,
            isError: false
          };
        
        case 'support':
        case 'help me':
        case 'contact':
          return {
            message: `Hello ${firstName}! \n\n We're here to help 24/7!\n\n Contact options:\n•  Email: support@Talk2Pay.com\n•  Phone: +234-800-CRYPTO\n•  Live chat: Available in app\n•  Website: Talk2Pay.com/help\n\n Emergency? Call immediately!\n\n Quick self-help:\n• Type 'balance' - Check wallet\n• Type 'fund' - Add money\n• Type 'about' - Learn about us\n• Type 'help' - All commands\n\n Average response time: 2 minutes`,
            isError: false
          };
        
        case 'change pin':
        case 'reset pin':
          return {
            message: `Hello ${firstName}! \n\n️ PIN Change Request\n\nFor security, PIN changes require:\n1️⃣ Current PIN verification\n2️⃣ Phone number confirmation\n3️⃣ New PIN creation\n\n️ This process is handled securely in our mobile app or web dashboard.\n\n Please visit: Talk2Pay.com/security\n\n🆘 Forgot your PIN? Contact support immediately:\n +234-800-CRYPTO`,
            isError: false
          };
        
        default:
          return {
            message: this.formatUnrecognizedCommandResponse(firstName, command, channel),
            isError: true
          };
      }
    } catch (error) {
      return {
        message: 'Sorry, there was an error processing your request. Please try again or contact support at +234-800-CRYPTO.',
        isError: true
      };
    }
  }

  private formatHelpResponse(firstName: string, channel: 'whatsapp' | 'ussd'): string {
    const greeting = `Hello ${firstName}!  Welcome to Talk2Pay!\n\nHere are the available commands:`;
    const commands = this.availableCommands.join('\n• ');
    
    if (channel === 'ussd') {
      // Format for USSD constraints (shorter lines)
      return `${greeting}\n\n• ${commands}\n\nType any command to get started!`;
    } else {
      // Format for WhatsApp (can be longer)
      return `${greeting}\n\n• ${commands}\n\n Tip: Just type the command name (like 'balance' or 'send') to get started!\n\n Ready to manage your crypto? Type a command now!\n\n🆕 New here? Type 'setup [YourName]' to create your wallet!`;
    }
  }

  private formatFundingResponse(firstName: string, channel: 'whatsapp' | 'ussd'): string {
    const greeting = `Hello ${firstName}!  Let's add money to your wallet!`;
    
    const fundingOptions = [
      ' Bank Transfer - Instant, no fees',
      ' Debit Card - Quick and easy',
      ' Cash Deposit - Visit our agents',
      '₿ Crypto Deposit - Send from another wallet',
      ' Mobile Money - MTN, Airtel, etc.'
    ];
    
    if (channel === 'ussd') {
      return `${greeting}\n\nFunding options:\n${fundingOptions.join('\n')}\n\nVisit app for easy funding or call support: +234-800-CRYPTO`;
    } else {
      return `${greeting}\n\n Choose your funding method:\n${fundingOptions.join('\n')}\n\n All transactions require your secure PIN for safety.\n\n For instant funding with full features, use our mobile app or web dashboard.\n\n Need help? Type 'support' or call +234-800-CRYPTO`;
    }
  }

  private formatUnrecognizedCommandResponse(
    firstName: string, 
    command: string, 
    channel: 'whatsapp' | 'ussd'
  ): string {
    const errorMessage = `Hello ${firstName}! \n\nI didn't recognize "${command}".`;
    const helpText = 'Here are some popular commands:';
    const commands = [
      'setup - Create your wallet',
      'balance - Check your money',
      'fund - Add money',
      'send - Transfer crypto',
      'help - All commands'
    ];
    
    if (channel === 'ussd') {
      return `${errorMessage}\n\n${helpText}\n• ${commands.join('\n• ')}\n\nType 'help' for all commands.`;
    } else {
      return `${errorMessage}\n\n${helpText}\n• ${commands.join('\n• ')}\n\n Quick tips:\n• Type 'about' to learn about Talk2Pay\n• Type 'setup John' to create a wallet\n• Type 'help' to see all commands\n\n What would you like to do?`;
    }
  }

  private async handleFundingMethodSelection(phoneNumber: string, selection: string): Promise<CommandResponse> {
    try {
      const merchant = await this.authService.findMerchantByPhoneNumber(phoneNumber);
      if (!merchant) {
        this.fundingFlow.delete(phoneNumber);
        return {
          message: 'Account not found. Please type "setup" to create your wallet first.',
          isError: true
        };
      }

      const firstName = merchant.firstName;
      let selectedMethod = '';
      let methodDetails = '';

      // Handle funding method selection
      switch (selection.toLowerCase()) {
        case '1️⃣':
        case '1':
        case 'bank':
        case 'bank transfer':
          selectedMethod = 'Bank Transfer';
          methodDetails = `Great choice, ${firstName}! 🏦\n\n📋 Bank Transfer Details:\n• Processing: 1-2 hours\n• Fees: FREE\n• Minimum: $10\n• Maximum: $10,000\n\n🏛️ Send money to:\nAccount: Talk2Pay Funding\nBank: First Bank Nigeria\nAccount Number: 1234567890\nReference: ${phoneNumber.replace('+', '')}\n\n⚠️ IMPORTANT: Use your phone number (${phoneNumber.replace('+', '')}) as the transfer reference!\n\n💡 After transfer, it will reflect automatically in 1-2 hours.\n\n Need help? Type 'support'`;
          break;

        case '2️⃣':
        case '2':
        case 'card':
        case 'debit':
        case 'debit card':
          selectedMethod = 'Debit Card';
          methodDetails = `Perfect, ${firstName}! 💳\n\n📋 Debit Card Funding:\n• Processing: Instant\n• Fees: 2.5%\n• Minimum: $5\n• Maximum: $5,000\n\n🔗 Click this secure link to pay:\nhttps://pay.Talk2Pay.com/card/${phoneNumber.replace('+', '')}\n\n🔒 Your payment is secured by:\n• 256-bit SSL encryption\n• PCI DSS compliance\n• 3D Secure verification\n\n💡 Funds appear instantly after payment!\n\n Need help? Type 'support'`;
          break;

        case '3️⃣':
        case '3':
        case 'cash':
        case 'cash deposit':
          selectedMethod = 'Cash Deposit';
          methodDetails = `Excellent, ${firstName}! 💵\n\n📋 Cash Deposit Options:\n• Processing: Instant\n• Fees: FREE\n• Minimum: $5\n• Maximum: $2,000\n\n🏪 Visit any of these locations:\n• GTBank branches nationwide\n• Quickteller agents\n• POS operators with Talk2Pay\n• Shopping malls (Shoprite, Game)\n\n📱 Show them this code: ${phoneNumber.replace('+', '')}\n\n💡 Funds appear instantly after deposit!\n\n📍 Find nearest agent: Type 'agents near me'\n\n Need help? Type 'support'`;
          break;

        case '4️⃣':
        case '4':
        case 'crypto':
        case 'bitcoin':
        case 'crypto deposit':
          selectedMethod = 'Crypto Deposit';
          methodDetails = `Smart choice, ${firstName}! ₿\n\n📋 Crypto Deposit Details:\n• Processing: 30-60 minutes\n• Fees: Network fees only\n• Minimum: $10\n• Supported: BTC, ETH, USDT\n\n📧 Your deposit addresses:\n🟠 Bitcoin (BTC):\n1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q\n\n🔵 Ethereum (ETH/USDT):\n0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t\n\n⚠️ IMPORTANT:\n• Only send supported cryptocurrencies\n• Double-check the address\n• Minimum confirmations: 3\n\n💡 Track your deposit: blockchain.info\n\n Need help? Type 'support'`;
          break;

        case '5️⃣':
        case '5':
        case 'mobile':
        case 'mobile money':
        case 'mtn':
        case 'airtel':
          selectedMethod = 'Mobile Money';
          methodDetails = `Perfect, ${firstName}! 📱\n\n📋 Mobile Money Details:\n• Processing: Instant\n• Fees: 1%\n• Minimum: $2\n• Maximum: $1,000\n\n📞 Supported networks:\n• MTN Mobile Money\n• Airtel Money\n• Glo Mobile Money\n• 9mobile Easy Wallet\n\n💳 Payment steps:\n1. Dial *737*50*Amount*${phoneNumber.replace('+234', '')}#\n2. Enter your mobile money PIN\n3. Confirm the transaction\n\n💡 Funds appear instantly!\n\n📱 Alternative: Use mobile money app and send to ${phoneNumber}\n\n Need help? Type 'support'`;
          break;

        case 'cancel':
        case 'back':
        case 'exit':
          this.fundingFlow.delete(phoneNumber);
          return {
            message: `No problem, ${firstName}! \n\nFunding cancelled. You can always type 'fund' again when you're ready to add money to your wallet.\n\n💡 Quick commands:\n• Type 'balance' to check wallet\n• Type 'help' for all options`,
            isError: false
          };

        default:
          return {
            message: `Sorry ${firstName}, I didn't understand "${selection}".\n\n🏦 Please choose a funding method:\n\n1️⃣ Bank Transfer\n2️⃣ Debit Card\n3️⃣ Cash Deposit\n4️⃣ Crypto Deposit\n5️⃣ Mobile Money\n\n💡 Or type 'cancel' to exit funding`,
            isError: true,
            requiresInput: true,
            nextStep: 'funding_method'
          };
      }

      // Clear funding flow after successful selection
      this.fundingFlow.delete(phoneNumber);

      return {
        message: methodDetails,
        isError: false
      };

    } catch (error) {
      this.fundingFlow.delete(phoneNumber);
      return {
        message: 'Sorry, there was an error processing your funding request. Please try again or contact support.',
        isError: true
      };
    }
  }
}