package com.AgentInsight.entity;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "incentives")
public class Incentive {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incentiveid", unique = true)
    private String incentiveid;

    @Column(name = "agentid")
    private String agentid;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "calculationdate")
    private Date calculationdate;

    @Column(name = "status")
    private String status;

    // Default constructor
    public Incentive() {}

    // Constructor
    public Incentive(String incentiveid, String agentid, Double amount, Date calculationdate, String status) {
        this.incentiveid = incentiveid;
        this.agentid = agentid;
        this.amount = amount;
        this.calculationdate = calculationdate;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIncentiveid() {
        return incentiveid;
    }

    public void setIncentiveid(String incentiveid) {
        this.incentiveid = incentiveid;
    }

    public String getAgentid() {
        return agentid;
    }

    public void setAgentid(String agentid) {
        this.agentid = agentid;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Date getCalculationdate() {
        return calculationdate;
    }

    public void setCalculationdate(Date calculationdate) {
        this.calculationdate = calculationdate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
