package com.AgentInsight.controller;

import com.AgentInsight.dto.IncentiveDto;
import com.AgentInsight.entity.Incentive;
import com.AgentInsight.service.IncentiveService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/incentives")
public class IncentiveController {
    private static final Logger logger = LoggerFactory.getLogger(IncentiveController.class);
    private final IncentiveService incentiveService;

    @Autowired
    public IncentiveController(IncentiveService incentiveService) {
        this.incentiveService = incentiveService;
    }

    @GetMapping
    public ResponseEntity<List<IncentiveDto>> getAllIncentives() {
        logger.info("Fetching all incentives with details");
        List<IncentiveDto> incentives = incentiveService.getAllIncentivesWithDetails();
        logger.info("Retrieved {} incentives", incentives.size());
        return ResponseEntity.ok(incentives);
    }
    @GetMapping("/basic")
    public ResponseEntity<List<IncentiveDto>> getIncentives() {
        List<IncentiveDto> incentives = incentiveService.getIncentives();
        return ResponseEntity.ok(incentives);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<IncentiveDto>> getAllIncentivesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        logger.info("Fetching paginated incentives with details - page: {}, size: {}", page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<IncentiveDto> incentives = incentiveService.getAllIncentivesWithDetails((java.awt.print.Pageable) pageable);
        logger.info("Retrieved {} incentives for page {}", incentives.getNumberOfElements(), page);
        return ResponseEntity.ok(incentives);
    }

    @GetMapping("/basic/paginated")
    public ResponseEntity<Page<IncentiveDto>> getIncentivesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<IncentiveDto> incentives = incentiveService.getIncentives((java.awt.print.Pageable) pageable);
        return ResponseEntity.ok(incentives);
    }

    @GetMapping("/agent/{agentid}")
    public ResponseEntity<List<IncentiveDto>> getIncentivesByAgentId(@PathVariable String agentid) {
        logger.info("Fetching incentives for agentId: {}", agentid);
        List<IncentiveDto> incentives = incentiveService.getIncentivesByAgentId(agentid);
        logger.info("Retrieved {} incentives for agentId: {}", incentives.size(), agentid);
        return ResponseEntity.ok(incentives);
    }

    @GetMapping("/{incentiveid}")
    public ResponseEntity<IncentiveDto> getIncentiveByIncentiveId(@PathVariable String incentiveid) {
        logger.info("Fetching incentive by ID: {}", incentiveid);
        IncentiveDto incentive = incentiveService.getIncentiveByIncentiveId(incentiveid);
        if (incentive != null) {
            logger.info("Incentive found: {}", incentiveid);
            return ResponseEntity.ok(incentive);
        }
        logger.warn("Incentive not found: {}", incentiveid);
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Incentive> createIncentive(@RequestBody Incentive incentive) {
        Incentive created = incentiveService.createIncentive(incentive);
        return ResponseEntity.ok(created);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{incentiveid}/status")
    public ResponseEntity<Incentive> updateIncentiveStatus(
            @PathVariable String incentiveid,
            @RequestParam String status) {
        logger.info("Updating incentive {} status to {}", incentiveid, status);
        try {
            Incentive updated = incentiveService.updateIncentiveStatus(incentiveid, status);
            logger.info("Incentive {} status updated successfully", incentiveid);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("Failed to update incentive {} status: {}", incentiveid, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Analytics endpoints
    @GetMapping("/analytics/total-amount")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Double> getTotalIncentivesAmount() {
        logger.info("Fetching total incentives amount");
        Double total = incentiveService.getTotalIncentivesAmount();
        logger.info("Total incentives amount: {}", total);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/analytics/total-bonus")
    public ResponseEntity<Double> getTotalBonusAmount() {
        logger.info("Fetching total bonus amount");
        Double bonus = incentiveService.getTotalBonusAmount();
        logger.info("Total bonus amount: {}", bonus);
        return ResponseEntity.ok(bonus);
    }

    @GetMapping("/analytics/pending-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Integer> getPendingCount() {
        logger.info("Fetching pending incentives count");
        Integer count = incentiveService.getPendingCount();
        logger.info("Pending incentives count: {}", count);
        return ResponseEntity.ok(count);
    }
}
