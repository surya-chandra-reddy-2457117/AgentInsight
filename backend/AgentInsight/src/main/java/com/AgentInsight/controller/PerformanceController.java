package com.AgentInsight.controller;

import com.AgentInsight.dto.AgentPerformanceDTO;
import com.AgentInsight.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200",allowedHeaders = "*")
@RequestMapping("/performance")
public class PerformanceController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{agentId}")
    public ResponseEntity<AgentPerformanceDTO> getAgentPerformance(@PathVariable String agentId) {
        return ResponseEntity.ok(userService.getAgentPerformanceById(agentId));
    }

}
