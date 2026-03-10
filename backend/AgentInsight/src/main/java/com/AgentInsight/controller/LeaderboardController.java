package com.AgentInsight.controller;

import com.AgentInsight.dto.LeaderboardDto;
import com.AgentInsight.entity.Leaderboard;
import com.AgentInsight.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @Autowired
    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<List<LeaderboardDto>> getAllLeaderboardEntries() {
        List<LeaderboardDto> entries = leaderboardService.getAllLeaderboardEntries();
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/{entryId}")
    public ResponseEntity<LeaderboardDto> getLeaderboardEntryByEntryId(@PathVariable String entryId) {
        LeaderboardDto entry = leaderboardService.getLeaderboardEntryByEntryId(entryId);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<LeaderboardDto> getLeaderboardEntryByAgentId(@PathVariable String agentId) {
        LeaderboardDto entry = leaderboardService.getLeaderboardEntryByAgentId(agentId);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Leaderboard> createLeaderboardEntry(@RequestBody Leaderboard entry) {
        Leaderboard created = leaderboardService.createLeaderboardEntry(entry);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{entryId}")
    public ResponseEntity<Leaderboard> updateLeaderboardEntry(@PathVariable String entryId, @RequestBody Leaderboard entry) {
        entry.setEntryId(entryId); // Ensure the ID matches the path variable
        Leaderboard updated = leaderboardService.updateLeaderboardEntry(entry);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> deleteLeaderboardEntry(@PathVariable String entryId) {
        leaderboardService.deleteLeaderboardEntry(entryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/top/{limit}")
    public ResponseEntity<List<LeaderboardDto>> getTopPerformers(@PathVariable int limit) {
        List<LeaderboardDto> topPerformers = leaderboardService.getTopPerformers(limit);
        return ResponseEntity.ok(topPerformers);
    }

    @PostMapping("/recalculate-ranks")
    public ResponseEntity<Void> recalculateRanks() {
        leaderboardService.recalculateRanks();
        return ResponseEntity.ok().build();
    }
}
