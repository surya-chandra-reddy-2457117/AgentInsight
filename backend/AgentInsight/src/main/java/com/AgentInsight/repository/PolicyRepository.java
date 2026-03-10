package com.AgentInsight.repository;

import com.AgentInsight.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    Optional<Policy> findByPolicyId(String policyId);
    void deleteByPolicyId(String policyId);
}
