package com.AgentInsight.repository;

import com.AgentInsight.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    Optional<Leaderboard> findByEntryId(String entryId);
    Optional<Leaderboard> findByAgentId(String agentId);
    void deleteByEntryId(String entryId);
}
