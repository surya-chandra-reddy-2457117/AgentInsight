package com.AgentInsight.service;

import com.AgentInsight.dto.IncentiveDto;
import com.AgentInsight.entity.Incentive;
import com.AgentInsight.entity.Sales;
import org.springframework.data.domain.Page;

import java.awt.print.Pageable;
import java.util.List;

public interface IncentiveService {
    List<IncentiveDto> getAllIncentives();
    List<IncentiveDto> getIncentives();
    List<IncentiveDto> getAllIncentivesWithDetails();
    Page<IncentiveDto> getAllIncentivesWithDetails(Pageable pageable);
    Page<IncentiveDto> getIncentives(Pageable pageable);

    Page<IncentiveDto> getAllIncentivesWithDetails(org.springframework.data.domain.Pageable pageable);

    Page<IncentiveDto> getIncentives(org.springframework.data.domain.Pageable pageable);

    IncentiveDto getIncentiveByIncentiveId(String incentiveId);
    IncentiveDto getIncentiveByAgentId(String agentId);
    Incentive createIncentive(Incentive incentive);
    Incentive updateIncentive(Incentive incentive);
    void deleteIncentive(String incentiveId);
    List<IncentiveDto> getPendingIncentives();
    List<IncentiveDto> getIncentivesByAgentId(String agentId);
    Incentive updateIncentiveStatus(String incentiveId, String status);
    Double getTotalIncentivesAmount();
    Double getTotalBonusAmount();
    Integer getPendingCount();
    void calculateAndCreateIncentiveForSale(Sales sale);
}
