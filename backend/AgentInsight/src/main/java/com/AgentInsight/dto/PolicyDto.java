package com.AgentInsight.dto;

public class PolicyDto {
    private String policyid;
    private String name;

    // Default constructor
    public PolicyDto() {}

    // Constructor
    public PolicyDto(String policyid, String name) {
        this.policyid = policyid;
        this.name = name;
    }

    // Getters and Setters
    public String getPolicyid() {
        return policyid;
    }

    public void setPolicyid(String policyid) {
        this.policyid = policyid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
