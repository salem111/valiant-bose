export interface TargetLevel {
  id: string;
  name: string;
  diamondsTarget: number;
  hostReward: number;
  agentReward: number;
  requiredHours: number;
  requiredDays: number;
  currency: "diamonds";
  enabled: boolean;
}

interface GetTargetsResponse {
  targets: TargetLevel[];
}

export const FALLBACK_TARGETS: TargetLevel[] = [
  { id: "target_10k", name: "Target 10K", diamondsTarget: 10000, hostReward: 6, agentReward: 1.11, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_20k", name: "Target 20K", diamondsTarget: 20000, hostReward: 12, agentReward: 2.22, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_40k", name: "Target 40K", diamondsTarget: 40000, hostReward: 20, agentReward: 4.44, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_65k", name: "Target 65K", diamondsTarget: 65000, hostReward: 28, agentReward: 7.22, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_100k", name: "Target 100K", diamondsTarget: 100000, hostReward: 50, agentReward: 11.11, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_150k", name: "Target 150K", diamondsTarget: 150000, hostReward: 67, agentReward: 22.22, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_275k", name: "Target 275K", diamondsTarget: 275000, hostReward: 123, agentReward: 40.74, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_375k", name: "Target 375K", diamondsTarget: 375000, hostReward: 153, agentReward: 69.44, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_500k", name: "Target 500K", diamondsTarget: 500000, hostReward: 200, agentReward: 92.59, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_750k", name: "Target 750K", diamondsTarget: 750000, hostReward: 310, agentReward: 138.89, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
  { id: "target_1m", name: "Target 1M", diamondsTarget: 1000000, hostReward: 375, agentReward: 222.22, requiredHours: 8, requiredDays: 4, currency: "diamonds", enabled: true },
];

/**
 * جلب جميع التارجت من Encore مع دعم الـ Fallback
 */
export async function getTargets(): Promise<TargetLevel[]> {
  try {
    const response = await fetch("/targets");
    if (!response.ok) {
      return FALLBACK_TARGETS;
    }
    const data: GetTargetsResponse = await response.json();
    return data.targets && data.targets.length > 0 ? data.targets : FALLBACK_TARGETS;
  } catch {
    return FALLBACK_TARGETS;
  }
}

