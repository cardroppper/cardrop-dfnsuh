
import { useMemo } from 'react';

export interface PricingTier {
  tier: 'free' | 'tier_50' | 'tier_100' | 'tier_200' | 'tier_500' | 'custom';
  maxMembers: number;
  monthlyPrice: number;
  label: string;
}

export const PRICING_TIERS: PricingTier[] = [
  { tier: 'free', maxMembers: 15, monthlyPrice: 0, label: 'Free (up to 15 members)' },
  { tier: 'tier_50', maxMembers: 50, monthlyPrice: 15, label: 'Up to 50 members - $15/month' },
  { tier: 'tier_100', maxMembers: 100, monthlyPrice: 25, label: 'Up to 100 members - $25/month' },
  { tier: 'tier_200', maxMembers: 200, monthlyPrice: 40, label: 'Up to 200 members - $40/month' },
  { tier: 'tier_500', maxMembers: 500, monthlyPrice: 75, label: 'Up to 500 members - $75/month' },
];

export function useClubPricing() {
  const calculatePricing = (memberCount: number): PricingTier => {
    if (memberCount <= 15) {
      return PRICING_TIERS[0]; // Free
    } else if (memberCount <= 50) {
      return PRICING_TIERS[1];
    } else if (memberCount <= 100) {
      return PRICING_TIERS[2];
    } else if (memberCount <= 200) {
      return PRICING_TIERS[3];
    } else if (memberCount <= 500) {
      return PRICING_TIERS[4];
    } else {
      // Custom pricing: $0.15 per member
      return {
        tier: 'custom',
        maxMembers: memberCount,
        monthlyPrice: memberCount * 0.15,
        label: `${memberCount} members - $${(memberCount * 0.15).toFixed(2)}/month`,
      };
    }
  };

  const getTierForMemberCount = useMemo(() => calculatePricing, []);

  return {
    PRICING_TIERS,
    calculatePricing,
    getTierForMemberCount,
  };
}
