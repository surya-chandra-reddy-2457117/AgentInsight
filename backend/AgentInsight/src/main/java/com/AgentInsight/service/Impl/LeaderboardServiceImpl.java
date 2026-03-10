package com.AgentInsight.service.Impl;

import com.AgentInsight.dto.LeaderboardDto;
import com.AgentInsight.entity.Leaderboard;
import com.AgentInsight.repository.LeaderboardRepository;
import com.AgentInsight.repository.SalesRepository;
import com.AgentInsight.service.LeaderboardService;
import com.AgentInsight.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardServiceImpl implements LeaderboardService {

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private UserService userService;

    @Override
    public List<LeaderboardDto> getAllLeaderboardEntries() {
        List<Leaderboard> entries = leaderboardRepository.findAll();
        return entries.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public LeaderboardDto getLeaderboardEntryByEntryId(String entryId) {
        Optional<Leaderboard> entry = leaderboardRepository.findByEntryId(entryId);
        return entry.map(this::convertToDto).orElse(null);
    }

    @Override
    public LeaderboardDto getLeaderboardEntryByAgentId(String agentId) {
        Optional<Leaderboard> entry = leaderboardRepository.findByAgentId(agentId);
        return entry.map(this::convertToDto).orElse(null);
    }

    @Override
    public Leaderboard createLeaderboardEntry(Leaderboard entry) {
        entry.setLastUpdated(new Date());
        return leaderboardRepository.save(entry);
    }

    @Override
    public Leaderboard updateLeaderboardEntry(Leaderboard entry) {
        entry.setLastUpdated(new Date());
        return leaderboardRepository.save(entry);
    }

    @Override
    public void deleteLeaderboardEntry(String entryId) {
        leaderboardRepository.deleteByEntryId(entryId);
    }

    @Override
    public List<LeaderboardDto> getTopPerformers(int limit) {
        return getAllLeaderboardEntries().stream()
                .sorted((a, b) -> Double.compare(b.getTotalSales(), a.getTotalSales()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public void recalculateRanks() {
        List<Leaderboard> entries = leaderboardRepository.findAll();
        entries.sort((a, b) -> Double.compare(b.getTotalSales(), a.getTotalSales()));

        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
            entries.get(i).setLastUpdated(new Date());
        }

        leaderboardRepository.saveAll(entries);
    }

    private LeaderboardDto convertToDto(Leaderboard entry) {
        String agentName = userService.getAllUsers().stream()
                .filter(user -> user.getAgentid().equals(entry.getAgentId()))
                .map(user -> user.getName())
                .findFirst()
                .orElse(entry.getAgentId());

        return new LeaderboardDto(
                entry.getEntryId(),
                entry.getAgentId(),
                entry.getRank(),
                entry.getTotalSales(),
                agentName
        );
    }
}
