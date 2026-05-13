import { FamilyService } from './familyService';
import { InviteCodeValidation } from '../types/family.types';

export const InviteService = {
  async generateInviteLink(familyId: string): Promise<string> {
    const family = await FamilyService.getFamilyByUserId(familyId);
    if (!family) {
      throw new Error('Family not found');
    }
    
    // In production, this would be a deep link: finmate://join?code=XXXXX
    // For now, return the invite code
    return `finmate://join?code=${family.inviteCode}`;
  },

  async validateInviteCode(inviteCode: string): Promise<InviteCodeValidation> {
    return await FamilyService.validateInviteCode(inviteCode);
  },

  async parseInviteLink(link: string): Promise<string | null> {
    try {
      const url = new URL(link);
      if (url.protocol === 'finmate:' && url.pathname === '//join') {
        return url.searchParams.get('code');
      }
      return null;
    } catch {
      return null;
    }
  },

  formatInviteCode(code: string): string {
    // Format as XXXX-XXXX for better readability
    if (code.length === 8) {
      return `${code.substring(0, 4)}-${code.substring(4)}`;
    }
    return code;
  },

  unformatInviteCode(formattedCode: string): string {
    // Remove dashes and convert to uppercase
    return formattedCode.replace(/-/g, '').toUpperCase();
  },
};
