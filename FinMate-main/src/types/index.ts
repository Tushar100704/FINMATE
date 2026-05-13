// Core Types for FinMate

export type TransactionType = 'sent' | 'received';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  merchant: string;
  upiId: string;
  category: string;
  date: string;
  time: string;
  status: TransactionStatus;
  bankAccount?: string;
  upiRef?: string;
  notes?: string;
  isAutoDetected?: boolean;
  smsId?: string;
  confidence?: number;
  isShared?: boolean;
  familyId?: string;
  syncedAt?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  syncedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface Alert {
  id: string;
  type: 'budget_exceeded' | 'unusual_spending' | 'large_transaction' | 'reminder';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionRequired?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  monthlyBudget: number;
  currency: string;
}

export interface SMSMessage {
  id: string;
  body: string;
  address: string;
  date: number;
  read: boolean;
}

export interface ParsedSMS {
  type: TransactionType;
  amount: number;
  bankAccount: string;
  party: string;
  date: string;
  ref: string;
  category: string;
  confidence: number;
  rawSMS: string;
}

export interface SMSProcessingResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
  skipped?: boolean;
  reason?: string;
}

export interface SMSPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface ProcessedSMSRecord {
  smsId: string;
  hash: string;
  processedAt: string;
  transactionId?: string;
}
