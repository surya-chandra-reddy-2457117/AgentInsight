package com.AgentInsight.controller;

import com.AgentInsight.dto.PolicyDto;
import com.AgentInsight.entity.Policy;
import com.AgentInsight.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/policies")
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @GetMapping
    public ResponseEntity<List<PolicyDto>> getAllPolicies() {
        List<PolicyDto> policies = policyService.getAllPolicies();
        return ResponseEntity.ok(policies);
    }

    @GetMapping("/{policyId}")
    public ResponseEntity<PolicyDto> getPolicyByPolicyId(@PathVariable String policyId) {
        PolicyDto policy = policyService.getPolicyByPolicyId(policyId);
        if (policy != null) {
            return ResponseEntity.ok(policy);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Policy> createPolicy(@RequestBody Policy policy) {
        Policy created = policyService.createPolicy(policy);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{policyId}")
    public ResponseEntity<Policy> updatePolicy(@PathVariable String policyId, @RequestBody Policy policy) {
        policy.setPolicyId(policyId);
        Policy updated = policyService.updatePolicy(policy);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{policyId}")
    public ResponseEntity<Void> deletePolicy(@PathVariable String policyId) {
        policyService.deletePolicy(policyId);
        return ResponseEntity.noContent().build();
    }
}
