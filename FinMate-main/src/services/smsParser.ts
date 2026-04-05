// SMS Parser - Ported from Python regex patterns
import { ParsedSMS, TransactionType } from '../types';

interface RegexPattern {
  pattern: RegExp;
  type: TransactionType;
}

// Regex patterns for different bank SMS formats
const SMS_PATTERNS: RegexPattern[] = [
  // Kotak Bank - Debit
  {
    pattern: /Sent Rs\.([\d.]+) from (.*?) to (.*?) on (\d{2}-\d{2}-\d{2}).*?UPI Ref[ :]*(\d+)/i,
    type: 'sent',
  },
  // Kotak Bank - Credit
  {
    pattern: /Received Rs\.([\d.]+) in your (.*?) from (.*?) on (\d{2}-\d{2}-\d{2}).*?UPI Ref[: ]*(\d+)/i,
    type: 'received',
  },
  // Generic Credit with reversal
  {
    pattern: /Rs\.? ?([\d.]+) is credited to (.*?) Ref no ?(\d+)/i,
    type: 'received',
  },
  // SBI - Debit (Multiple formats)
  {
    pattern: /A\/C (.*?) debited by ([\d,]+\.?\d*).*?date (\d{2}[A-Za-z]{3}\d{2}).*?Refno (\d+)/i,
    type: 'sent',
  },
  {
    pattern: /Rs\.([\d,]+\.?\d*) debited from A\/C (.*?) on (\d{2}-\d{2}-\d{2}).*?Ref[: ]*(\d+)/i,
    type: 'sent',
  },
  {
    pattern: /debited.*?Rs\.([\d,]+\.?\d*).*?A\/C (.*?)(?:on|dated) (\d{2}[/-]\d{2}[/-]\d{2,4}).*?(?:Ref|UPI)[: ]*(\d+)/i,
    type: 'sent',
  },
  // SBI - Credit (New format: "Dear UPI User, your A/c XXXXXX5333-credited by Rs.1.00 on 21-11-25 transfer from...")
  {
    pattern: /A\/c\s+(X+\d+)-credited by Rs\.([\d,]+\.?\d*) on (\d{2}-\d{2}-\d{2}) transfer from (.*?)(?:\s|$)/i,
    type: 'received',
  },
  {
    pattern: /your A\/c\s+(X+\d+)-credited by Rs\.([\d,]+\.?\d*) on (\d{2}-\d{2}-\d{2})/i,
    type: 'received',
  },
  // SBI - Credit (Old formats)
  {
    pattern: /A\/C (.*?) credited by ([\d,]+\.?\d*).*?date (\d{2}[A-Za-z]{3}\d{2}).*?Refno (\d+)/i,
    type: 'received',
  },
  {
    pattern: /Rs\.([\d,]+\.?\d*) credited to A\/C (.*?) on (\d{2}-\d{2}-\d{2}).*?Ref[: ]*(\d+)/i,
    type: 'received',
  },
  {
    pattern: /credited.*?Rs\.([\d,]+\.?\d*).*?A\/C (.*?)(?:on|dated) (\d{2}[/-]\d{2}[/-]\d{2,4}).*?(?:Ref|UPI)[: ]*(\d+)/i,
    type: 'received',
  },
  // IPPB - Credit
  {
    pattern: /received a payment of Rs\.? ?([\d.]+).*?a\/c (.*?) on (\d{2}\/\d{2}\/\d{4}).*?Info: UPI\/CREDIT\/(\d+)/i,
    type: 'received',
  },
  // HDFC - Credit
  {
    pattern: /Rs\.([\d.]+) credited to (.*?) on (\d{2}-\d{2}-\d{2}).*?VPA (.*?) \(UPI (\d+)\)/i,
    type: 'received',
  },
  // IPPB - Debit
  {
    pattern: /A\/C (.*?) Debit Rs\.([\d.]+) for UPI to (.*?) on (\d{2}-\d{2}-\d{2}) Ref (\d+)/i,
    type: 'sent',
  },
  // Bank of Baroda (BOB) - Debit
  {
    pattern: /Rs ?([\d,]+\.?\d*) debited from A\/C (X+\d+) and credited to (.*?) UPI Ref[: ]*(\d+)/i,
    type: 'sent',
  },
  // Bank of Baroda (BOB) - Credit (Format 1: "Dear BOB UPI User, your account is credited INR 30.00 on Date 2025-05-21 12:28:41 PM by UPI Ref No 716448329298")
  {
    pattern: /your account is credited INR ([\d,]+\.?\d*) on Date (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [AP]M) by UPI Ref No (\d+)/i,
    type: 'received',
  },
  // Bank of Baroda (BOB) - Credit (Format 2: "Your account is credited with 1300.00 on 2025-07-10 11:12:58 AM by UPI Ref No 247178925703")
  {
    pattern: /Your account is credited with ([\d,]+\.?\d*) on (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [AP]M) by UPI Ref No (\d+)/i,
    type: 'received',
  },
];

/**
 * Categorize transaction based on merchant/party name and UPI ID
 */
export function categorizeTransaction(party: string, upiId: string = ''): string {
  if (!party && !upiId) return 'Others';
  
  const lowerParty = party.toLowerCase();
  const lowerUpiId = upiId.toLowerCase();
  const combined = `${lowerParty} ${lowerUpiId}`;

  // Food delivery & restaurants
  if (combined.includes('swiggy') || combined.includes('zomato') || 
      combined.includes('dominos') || combined.includes('mcdonald') ||
      combined.includes('kfc') || combined.includes('pizzahut') ||
      combined.includes('burgerking') || combined.includes('subway')) {
    return 'Food';
  }

  // Groceries & essentials
  if (combined.includes('blinkit') || combined.includes('bigbasket') || 
      combined.includes('dmart') || combined.includes('grofers') ||
      combined.includes('zepto') || combined.includes('dunzo') ||
      combined.includes('instamart') || combined.includes('jiomart')) {
    return 'Groceries';
  }

  // Recharge & Bills
  if (combined.includes('airtel') || combined.includes('jio') || 
      combined.includes('vi') || combined.includes('vodafone') ||
      combined.includes('idea') || combined.includes('bsnl') ||
      combined.includes('recharge') || combined.includes('billpay') ||
      combined.includes('electricity') || combined.includes('gas')) {
    return 'Recharge/Bills';
  }

  // Travel & transport
  if (combined.includes('uber') || combined.includes('ola') || 
      combined.includes('rapido') || combined.includes('irctc') ||
      combined.includes('makemytrip') || combined.includes('goibibo') ||
      combined.includes('redbus') || combined.includes('yatra')) {
    return 'Travel';
  }

  // Entertainment & subscriptions
  if (combined.includes('netflix') || combined.includes('spotify') || 
      combined.includes('prime') || combined.includes('hotstar') ||
      combined.includes('disney') || combined.includes('youtube') ||
      combined.includes('apple') && combined.includes('services')) {
    return 'Entertainment';
  }

  // Shopping & e-commerce
  if (combined.includes('amazon') || combined.includes('flipkart') || 
      combined.includes('myntra') || combined.includes('ajio') ||
      combined.includes('meesho') || combined.includes('snapdeal') ||
      combined.includes('nykaa') || combined.includes('tatacliq')) {
    return 'Shopping';
  }

  // P2P - Phone numbers or personal UPI IDs (check first before wallet)
  if (/^\d{10}@/.test(lowerUpiId) || lowerUpiId.includes('@yescred') || 
      lowerUpiId.includes('@okaxis') || lowerUpiId.includes('@ptsbi') ||
      lowerUpiId.includes('@sbi') || lowerUpiId.includes('@okicici')) {
    return 'P2P';
  }

  // Wallet/Payment apps (after P2P check)
  if (combined.includes('paytm') || combined.includes('phonepe') || 
      combined.includes('googlepay') || combined.includes('amazonpay') ||
      combined.includes('mobikwik') || combined.includes('freecharge')) {
    return 'P2P';
  }

  // Merchant payments
  if (combined.includes('bharatpe') || combined.includes('pinelabs') || 
      combined.includes('razorpay') || combined.includes('.rzp@') ||
      combined.includes('cashfree') || combined.includes('payu')) {
    return 'Shopping';
  }

  return 'Others';
}

/**
 * Calculate confidence score for parsed SMS
 */
function calculateConfidence(smsBody: string, match: RegExpMatchArray, type: TransactionType): number {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for complete matches with all expected groups
  if (match.length >= 5) {
    confidence += 0.2;
  }
  
  // Higher confidence for known bank senders
  const knownBanks = ['kotak', 'sbi', 'hdfc', 'axis', 'icici', 'paytm', 'phonepe'];
  const lowerSMS = smsBody.toLowerCase();
  if (knownBanks.some(bank => lowerSMS.includes(bank))) {
    confidence += 0.2;
  }
  
  // Higher confidence for UPI reference numbers
  if (/upi.*ref.*\d+/i.test(smsBody) || /ref.*no.*\d+/i.test(smsBody)) {
    confidence += 0.1;
  }
  
  // Higher confidence for proper amount format
  if (/rs\.?\s*[\d,]+\.?\d*/i.test(smsBody)) {
    confidence += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Parse SMS message and extract transaction details with confidence scoring
 */
export function parseSMS(smsBody: string): ParsedSMS | null {
  if (!smsBody) return null;

  console.log('🔍 Parsing SMS:', smsBody.substring(0, 100) + '...');

  for (const { pattern, type } of SMS_PATTERNS) {
    const match = smsBody.match(pattern);
    
    if (match) {
      console.log('✅ SMS matched pattern:', type, 'Groups:', match.length - 1);
      const groups = match.slice(1); // Remove full match, keep groups
      
      let amount: number;
      let bankAccount: string;
      let party: string;
      let date: string;
      let ref: string;

      if (type === 'sent') {
        // Handle different debit patterns
        if (groups.length === 5) {
          // Pattern: Sent Rs.X from BANK to PARTY on DATE.UPI Ref REF
          [amount, bankAccount, party, date, ref] = [
            parseFloat(groups[0]),
            groups[1],
            groups[2],
            groups[3],
            groups[4],
          ];
        } else if (groups.length === 4) {
          // Check if it's BOB debit: Rs X debited from A/C BANK and credited to PARTY UPI Ref REF
          if (smsBody.toLowerCase().includes('debited from a/c') && smsBody.toLowerCase().includes('credited to')) {
            // BOB debit format: [amount, bankAccount, party, ref]
            [amount, bankAccount, party, ref] = [
              parseFloat(groups[0].replace(/,/g, '')),
              groups[1],
              groups[2],
              groups[3],
            ];
            date = 'Unknown';
          } else {
            // Pattern: A/C BANK debited by AMOUNT on DATE Refno REF
            [bankAccount, amount, date, ref] = [
              groups[0],
              parseFloat(groups[1]),
              groups[2],
              groups[3],
            ];
            party = 'Unknown';
          }
        } else {
          continue;
        }
      } else {
        // Handle different credit patterns
        if (groups.length === 5) {
          // Pattern: Received Rs.X in BANK from PARTY on DATE.UPI Ref REF
          [amount, bankAccount, party, date, ref] = [
            parseFloat(groups[0]),
            groups[1],
            groups[2],
            groups[3],
            groups[4],
          ];
        } else if (groups.length === 4) {
          // Check if it's the new SBI format: A/c X5333-credited by Rs.1.00 on 21-11-25 transfer from PARTY
          if (smsBody.toLowerCase().includes('credited by rs.')) {
            // New SBI format: [bankAccount, amount, date, party]
            [bankAccount, amount, date, party] = [
              groups[0],
              parseFloat(groups[1].replace(/,/g, '')),
              groups[2],
              groups[3],
            ];
            ref = 'N/A';
          } else {
            // Pattern: received payment of Rs.X in a/c BANK on DATE Info: UPI/CREDIT/REF
            [amount, bankAccount, date, ref] = [
              parseFloat(groups[0]),
              groups[1],
              groups[2],
              groups[3],
            ];
            party = 'Unknown';
          }
        } else if (groups.length === 3) {
          // Check if it's BOB credit: your account is credited INR X on Date DATETIME by UPI Ref No REF
          if (smsBody.toLowerCase().includes('account is credited') || smsBody.toLowerCase().includes('account is credited with')) {
            // BOB credit format: [amount, date, ref]
            [amount, date, ref] = [
              parseFloat(groups[0].replace(/,/g, '')),
              groups[1],
              groups[2],
            ];
            bankAccount = 'Unknown';
            party = 'Unknown';
          } else if (smsBody.toLowerCase().includes('credited by rs.')) {
            // New SBI format without party: [bankAccount, amount, date]
            [bankAccount, amount, date] = [
              groups[0],
              parseFloat(groups[1].replace(/,/g, '')),
              groups[2],
            ];
            party = 'Unknown';
            ref = 'N/A';
          } else {
            // Pattern: Rs.X credited to BANK Ref no REF (Reversal)
            [amount, bankAccount, ref] = [
              parseFloat(groups[0]),
              groups[1],
              groups[2],
            ];
            date = 'Unknown';
            party = 'Reversal';
          }
        } else {
          continue;
        }
      }

      const category = categorizeTransaction(party, party);
      
      // Calculate confidence score based on pattern match quality
      const confidence = calculateConfidence(smsBody, match, type);

      return {
        type,
        amount,
        bankAccount,
        party,
        date,
        ref,
        category,
        confidence,
        rawSMS: smsBody,
      };
    }
  }

  console.log('❌ No pattern matched for SMS');
  return null;
}

/**
 * Parse multiple SMS messages
 */
export function parseMultipleSMS(smsMessages: string[]): ParsedSMS[] {
  const parsed: ParsedSMS[] = [];
  
  for (const sms of smsMessages) {
    const result = parseSMS(sms);
    if (result) {
      parsed.push(result);
    }
  }
  
  return parsed;
}

/**
 * Check if SMS is a UPI transaction message
 */
export function isUPITransaction(smsBody: string): boolean {
  const upiKeywords = ['upi', 'sent rs', 'received rs', 'debited', 'credited'];
  const lowerBody = smsBody.toLowerCase();
  
  return upiKeywords.some(keyword => lowerBody.includes(keyword));
}
