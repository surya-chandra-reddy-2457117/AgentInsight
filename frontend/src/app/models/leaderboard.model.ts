export interface LeaderboardEntry {
  entryId: string;
  agentId: string;
  rank: number;
  totalSales: number;
}

export interface Badge {
  badgeId: string;
  agentId: string;
  badgeName: string;
  awardDate: string;
}
