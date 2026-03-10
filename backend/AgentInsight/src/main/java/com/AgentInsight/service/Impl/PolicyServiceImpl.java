package com.AgentInsight.service.Impl;

import com.AgentInsight.dto.PolicyDto;
import com.AgentInsight.entity.Policy;
import com.AgentInsight.repository.PolicyRepository;
import com.AgentInsight.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PolicyServiceImpl implements PolicyService {

    @Autowired
    private PolicyRepository policyRepository;

    @Override
    public List<PolicyDto> getAllPolicies() {
        List<Policy> policies = policyRepository.findAll();
        return policies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PolicyDto getPolicyByPolicyId(String policyId) {
        Optional<Policy> policy = policyRepository.findByPolicyId(policyId);
        return policy.map(this::convertToDto).orElse(null);
    }

    @Override
    public Policy createPolicy(Policy policy) {
        return policyRepository.save(policy);
    }

    @Override
    public Policy updatePolicy(Policy policy) {
        return policyRepository.save(policy);
    }

    @Override
    public void deletePolicy(String policyId) {
        policyRepository.deleteByPolicyId(policyId);
    }

    private PolicyDto convertToDto(Policy policy) {
        return new PolicyDto(
                policy.getPolicyId(),
                policy.getName()
        );
    }
}
