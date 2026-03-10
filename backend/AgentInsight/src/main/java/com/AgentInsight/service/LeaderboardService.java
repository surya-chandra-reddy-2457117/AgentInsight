package com.AgentInsight.service;

import com.AgentInsight.dto.LeaderboardDto;
import com.AgentInsight.entity.Leaderboard;

import java.util.List;

public interface LeaderboardService {
    List<LeaderboardDto> getAllLeaderboardEntries();
    LeaderboardDto getLeaderboardEntryByEntryId(String entryId);
    LeaderboardDto getLeaderboardEntryByAgentId(String agentId);
    Leaderboard createLeaderboardEntry(Leaderboard entry);
    Leaderboard updateLeaderboardEntry(Leaderboard entry);
    void deleteLeaderboardEntry(String entryId);
    List<LeaderboardDto> getTopPerformers(int limit);
    void recalculateRanks();
}
