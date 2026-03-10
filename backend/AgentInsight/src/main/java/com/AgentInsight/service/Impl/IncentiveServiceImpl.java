package com.AgentInsight.service.Impl;

import com.AgentInsight.dto.IncentiveDto;
import com.AgentInsight.entity.Incentive;
import com.AgentInsight.entity.Sales;
import com.AgentInsight.repository.IncentiveRepository;
import com.AgentInsight.service.IncentiveService;
import com.AgentInsight.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IncentiveServiceImpl implements IncentiveService {

    private static final Logger logger = LoggerFactory.getLogger(IncentiveServiceImpl.class);

    @Autowired
    private IncentiveRepository incentiveRepository;

    @Autowired
    private UserService userService;

    @Override
    public List<IncentiveDto> getAllIncentives() {
        List<Incentive> incentives = incentiveRepository.findAll();
        return incentives.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<IncentiveDto> getIncentives() {
        return getAllIncentives();
    }

    @Override
    public List<IncentiveDto> getAllIncentivesWithDetails() {
        return getAllIncentives();
    }

    @Override
    public Page<IncentiveDto> getAllIncentivesWithDetails(java.awt.print.Pageable pageable) {
        return null;
    }

    @Override
    public Page<IncentiveDto> getIncentives(java.awt.print.Pageable pageable) {
        return null;
    }

    @Override
    public Page<IncentiveDto> getAllIncentivesWithDetails(Pageable pageable) {
        Page<Incentive> incentivesPage = incentiveRepository.findAll(pageable);
        return incentivesPage.map(this::convertToDto);
    }

    @Override
    public Page<IncentiveDto> getIncentives(Pageable pageable) {
        return getAllIncentivesWithDetails(pageable);
    }

    @Override
    public IncentiveDto getIncentiveByIncentiveId(String incentiveId) {
        Optional<Incentive> incentive = incentiveRepository.findByIncentiveid(incentiveId);
        return incentive.map(this::convertToDto).orElse(null);
    }

    @Override
    public IncentiveDto getIncentiveByAgentId(String agentId) {
        List<Incentive> incentives = incentiveRepository.findByAgentid(agentId);
        return incentives.stream()
                .max((i1, i2) -> i1.getCalculationdate().compareTo(i2.getCalculationdate())) // Get most recent
                .map(this::convertToDto)
                .orElse(null);
    }

    @Override
    public Incentive createIncentive(Incentive incentive) {
        return incentiveRepository.save(incentive);
    }

    @Override
    public Incentive updateIncentive(Incentive incentive) {
        return incentiveRepository.save(incentive);
    }

    @Override
    public void deleteIncentive(String incentiveId) {
        incentiveRepository.deleteByIncentiveid(incentiveId);
    }

    @Override
    public List<IncentiveDto> getPendingIncentives() {
        List<Incentive> incentives = incentiveRepository.findByStatus("Pending");
        return incentives.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<IncentiveDto> getIncentivesByAgentId(String agentId) {
        List<Incentive> incentives = incentiveRepository.findByAgentid(agentId);
        return incentives.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Double getTotalIncentivesAmount() {
        return 0.0;
    }

    @Override
    public Double getTotalBonusAmount() {
        return 0.0;
    }

    @Override
    public Integer getPendingCount() {
        return 0;
    }

    @Override
    @Transactional
    public void calculateAndCreateIncentiveForSale(Sales sale) {
        logger.info("Creating incentive for sale: {}", sale.getSaleid());
        String incentiveId = "I-" + sale.getSaleid();

        // Check for duplicates
        if (incentiveRepository.findByIncentiveid(incentiveId).isPresent()) {
            logger.info("Incentive already exists for sale: {}", sale.getSaleid());
            return; // Already exists, do not create duplicate
        }

        // Use safe fallback for amount
        Double incentiveAmount = sale.getSaleamount() != null ? sale.getSaleamount() : 0.0;
        logger.info("Incentive amount: {}, agentid: {}", incentiveAmount, sale.getAgentid());

        // Create new incentive
        Incentive incentive = new Incentive(
                incentiveId,
                sale.getAgentid(),
                incentiveAmount,
                sale.getSaledate(),
                "Pending"
        );

        // Save the incentive
        try {
            Incentive savedIncentive = incentiveRepository.save(incentive);
            logger.info("Incentive created successfully: {} for sale {}", savedIncentive.getIncentiveid(), sale.getSaleid());
        } catch (Exception e) {
            logger.error("Failed to save incentive for sale {}: {}", sale.getSaleid(), e.getMessage(), e);
            // Do not throw to avoid failing the sale update
        }
    }

    @Override
    public Incentive updateIncentiveStatus(String incentiveId, String status) {
        Optional<Incentive> optionalIncentive = incentiveRepository.findByIncentiveid(incentiveId);
        if (optionalIncentive.isPresent()) {
            Incentive incentive = optionalIncentive.get();
            incentive.setStatus(status);
            return incentiveRepository.save(incentive);
        } else {
            return null;
        }
    }

    private IncentiveDto convertToDto(Incentive incentive) {
        String agentName = userService.getAllUsers().stream()
                .filter(user -> user.getAgentid().equals(incentive.getAgentid()))
                .map(user -> user.getName())
                .findFirst()
                .orElse(incentive.getAgentid());

        return new IncentiveDto(
                incentive.getIncentiveid(),
                incentive.getAgentid(),
                incentive.getAmount(),
                incentive.getCalculationdate(),
                incentive.getStatus(),
                agentName
        );
    }
}
