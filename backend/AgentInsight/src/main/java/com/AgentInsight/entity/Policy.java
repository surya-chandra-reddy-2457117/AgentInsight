package com.AgentInsight.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "policies")
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_id", unique = true)
    private String policyId;

    @Column(name = "name")
    private String name;

    // Default constructor
    public Policy() {}

    // Constructor
    public Policy(String policyId, String name) {
        this.policyId = policyId;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPolicyId() {
        return policyId;
    }

    public void setPolicyId(String policyId) {
        this.policyId = policyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
