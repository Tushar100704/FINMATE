export type FamilyRole = 'admin' | 'member';

export interface Family {
  id: string;
  name: string;
  createdByUserId: string;
  createdAt: number;
  inviteCode: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: FamilyRole;
  joinedAt: number;
  userName?: string;
  userEmail?: string;
}

export interface SharedTransaction {
  id: string;
  familyId: string;
  transactionId: string;
  sharedByUserId: string;
  sharedAt: number;
}

export interface FamilyWithMembers extends Family {
  members: FamilyMember[];
  memberCount: number;
}

export interface FamilyAnalytics {
  totalSpending: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  memberContributions: {
    userId: string;
    userName: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    amount: number;
  }[];
}

export interface InviteCodeValidation {
  isValid: boolean;
  family?: Family;
  error?: string;
}

export interface CreateFamilyParams {
  name: string;
  createdByUserId: string;
}

export interface JoinFamilyParams {
  inviteCode: string;
  userId: string;
}

export interface ShareTransactionParams {
  transactionId: string;
  familyId: string;
  sharedByUserId: string;
}
