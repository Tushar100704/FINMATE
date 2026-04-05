import { SMSMessage, Transaction, SMSProcessingResult, ParsedSMS } from '../types';
import { parseSMS, isUPITransaction } from './smsParser';
import { TransactionDB } from './database';
import { SMSService } from './smsService';
import { generateId, getCurrentTime } from '../utils/helpers';
import { useStore } from '../store/useStore';

export class TransactionProcessor {
  private static readonly MIN_CONFIDENCE_THRESHOLD = 0.6;
  private static readonly MIN_AMOUNT_THRESHOLD = 1; // Minimum ₹1
  private static readonly MAX_AMOUNT_THRESHOLD = 1000000; // Maximum ₹10 lakh

  /**
   * Process a single SMS message and create transaction if valid
   */
  static async processSMS(
    message: SMSMessage, 
    userId: string
  ): Promise<SMSProcessingResult> {
    try {
      console.log('🔄 Processing SMS:', message.id);

      // Step 1: Check if SMS is UPI-related
      if (!isUPITransaction(message.body)) {
        return {
          success: false,
          skipped: true,
          reason: 'Not a UPI transaction SMS'
        };
      }

      // Step 2: Parse SMS content
      const parsed = parseSMS(message.body);
      if (!parsed) {
        return {
          success: false,
          error: 'Failed to parse SMS content'
        };
      }

      // Step 3: Validate parsed data
      const validation = this.validateParsedSMS(parsed);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.reason
        };
      }

      // Step 4: Check for duplicates
      const isDuplicate = await this.checkForDuplicate(parsed, userId);
      if (isDuplicate) {
        return {
          success: false,
          skipped: true,
          reason: 'Duplicate transaction detected'
        };
      }

      // Step 5: Create transaction
      const transaction = this.createTransactionFromParsedSMS(parsed, message);
      
      // Step 6: Save to database
      await TransactionDB.create({ ...transaction, userId });

      // Step 7: Update Zustand store for reactive UI
      useStore.getState().addTransaction(transaction);

      // Step 8: Mark SMS as processed
      await SMSService.markSMSAsProcessed(message, userId, transaction.id);

      console.log('✅ Transaction created from SMS:', transaction.id);

      return {
        success: true,
        transaction
      };
    } catch (error) {
      console.error('❌ Error processing SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process multiple SMS messages in batch
   */
  static async processSMSBatch(
    messages: SMSMessage[], 
    userId: string
  ): Promise<{
    processed: number;
    created: number;
    skipped: number;
    errors: number;
    results: SMSProcessingResult[];
  }> {
    console.log(`🔄 Processing ${messages.length} SMS messages...`);

    const results: SMSProcessingResult[] = [];
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const message of messages) {
      const result = await this.processSMS(message, userId);
      results.push(result);

      if (result.success) {
        created++;
      } else if (result.skipped) {
        skipped++;
      } else {
        errors++;
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    console.log(`✅ SMS batch processing complete:`, {
      processed: messages.length,
      created,
      skipped,
      errors
    });

    return {
      processed: messages.length,
      created,
      skipped,
      errors,
      results
    };
  }

  /**
   * Validate parsed SMS data
   */
  private static validateParsedSMS(parsed: ParsedSMS): {
    isValid: boolean;
    reason?: string;
  } {
    // Check confidence threshold
    if (parsed.confidence < this.MIN_CONFIDENCE_THRESHOLD) {
      return {
        isValid: false,
        reason: `Low confidence score: ${parsed.confidence}`
      };
    }

    // Check amount validity
    if (parsed.amount < this.MIN_AMOUNT_THRESHOLD) {
      return {
        isValid: false,
        reason: `Amount too small: ₹${parsed.amount}`
      };
    }

    if (parsed.amount > this.MAX_AMOUNT_THRESHOLD) {
      return {
        isValid: false,
        reason: `Amount too large: ₹${parsed.amount}`
      };
    }

    // Check required fields
    if (!parsed.party || parsed.party.trim() === '') {
      return {
        isValid: false,
        reason: 'Missing merchant/party information'
      };
    }

    if (!parsed.type || !['sent', 'received'].includes(parsed.type)) {
      return {
        isValid: false,
        reason: 'Invalid transaction type'
      };
    }

    return { isValid: true };
  }

  /**
   * Check for duplicate transactions
   */
  private static async checkForDuplicate(
    parsed: ParsedSMS, 
    userId: string
  ): Promise<boolean> {
    try {
      // Get transactions from the same day
      const transactionDate = this.parseDate(parsed.date);
      const dateStr = transactionDate.toISOString().split('T')[0];

      const dayTransactions = await TransactionDB.getByDateRange(
        userId,
        dateStr,
        dateStr
      );

      // Check for similar transactions (same amount, similar time, same merchant)
      const duplicates = dayTransactions.filter(t => {
        const amountMatch = Math.abs(t.amount - parsed.amount) < 0.01;
        const merchantMatch = t.merchant.toLowerCase().includes(parsed.party.toLowerCase()) ||
                             parsed.party.toLowerCase().includes(t.merchant.toLowerCase());
        const typeMatch = t.type === parsed.type;

        return amountMatch && merchantMatch && typeMatch;
      });

      return duplicates.length > 0;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false; // If we can't check, allow the transaction
    }
  }

  /**
   * Create Transaction object from parsed SMS
   */
  private static createTransactionFromParsedSMS(
    parsed: ParsedSMS, 
    originalSMS: SMSMessage
  ): Transaction {
    const transactionDate = this.parseDate(parsed.date);
    
    return {
      id: generateId(),
      amount: parsed.amount,
      type: parsed.type,
      merchant: parsed.party,
      upiId: '', // Will be extracted if available in future
      category: parsed.category,
      date: transactionDate.toISOString().split('T')[0],
      time: getCurrentTime(),
      status: 'completed',
      bankAccount: parsed.bankAccount,
      upiRef: parsed.ref,
      notes: `Auto-detected from SMS`,
      isAutoDetected: true,
      smsId: originalSMS.id,
      confidence: parsed.confidence
    };
  }

  /**
   * Parse date from various SMS date formats
   */
  private static parseDate(dateStr: string): Date {
    if (!dateStr || dateStr === 'Unknown') {
      return new Date(); // Use current date if unknown
    }

    // Handle different date formats
    const formats = [
      /(\d{2})-(\d{2})-(\d{2})/, // DD-MM-YY
      /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
      /(\d{2})([A-Za-z]{3})(\d{2})/, // DDMmmYY (e.g., 15Nov24)
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        if (format === formats[0]) {
          // DD-MM-YY
          const [, day, month, year] = match;
          return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (format === formats[1]) {
          // DD/MM/YYYY
          const [, day, month, year] = match;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (format === formats[2]) {
          // DDMmmYY
          const [, day, monthStr, year] = match;
          const monthMap: { [key: string]: number } = {
            'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
            'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
          };
          const month = monthMap[monthStr.toLowerCase()];
          return new Date(2000 + parseInt(year), month, parseInt(day));
        }
      }
    }

    // If no format matches, return current date
    console.warn('Could not parse date:', dateStr);
    return new Date();
  }

  /**
   * Get processing statistics
   */
  static async getProcessingStats(userId: string): Promise<{
    totalAutoDetected: number;
    averageConfidence: number;
    lastProcessedAt: string | null;
  }> {
    try {
      const allTransactions = await TransactionDB.getAll(userId);
      const autoDetected = allTransactions.filter(t => t.isAutoDetected);

      const averageConfidence = autoDetected.length > 0
        ? autoDetected.reduce((sum, t) => sum + (t.confidence || 0), 0) / autoDetected.length
        : 0;

      const lastProcessed = autoDetected.length > 0
        ? autoDetected[0].date // Assuming sorted by date desc
        : null;

      return {
        totalAutoDetected: autoDetected.length,
        averageConfidence,
        lastProcessedAt: lastProcessed
      };
    } catch (error) {
      console.error('Error getting processing stats:', error);
      return {
        totalAutoDetected: 0,
        averageConfidence: 0,
        lastProcessedAt: null
      };
    }
  }
}
