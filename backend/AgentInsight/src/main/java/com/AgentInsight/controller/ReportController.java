package com.AgentInsight.controller;

import com.AgentInsight.dto.AgentReportDTO;
import com.AgentInsight.dto.IncentiveDto;
import com.AgentInsight.dto.UserDto;
import com.AgentInsight.entity.Sales;
import com.AgentInsight.service.IncentiveService;
import com.AgentInsight.service.SalesService;
import com.AgentInsight.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/reports")
public class ReportController {
    private final SalesService salesService;
    private final UserService userService;
    private final IncentiveService incentiveService;

    public ReportController(SalesService salesService, UserService userService, IncentiveService incentiveService) {
        this.salesService = salesService;
        this.userService = userService;
        this.incentiveService = incentiveService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/agent-performance")
    public ResponseEntity<List<AgentReportDTO>> getAgentReport() {
        return ResponseEntity.ok(userService.getAgentReport());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/allsales")
    public List<Sales> getAllSales(){
//        logger.info("getAllSales called");
        return salesService.getAllSales();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/allincentives")
    public ResponseEntity<List<IncentiveDto>> getAllIncentives() {
//        logger.info("Fetching all incentives with details");
        List<IncentiveDto> incentives = incentiveService.getAllIncentivesWithDetails();
//        logger.info("Retrieved {} incentives", incentives.size());
        return ResponseEntity.ok(incentives);
    }

}
