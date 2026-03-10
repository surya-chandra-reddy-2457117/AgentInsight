package com.AgentInsight.entity;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name = "leaderboard")
public class Leaderboard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entry_id", unique = true)
    private String entryId;

    @Column(name = "agent_id")
    private String agentId;

    @Column(name = "agent_rank")
    private Integer rank;

    @Column(name = "total_sales")
    private Double totalSales;

    @Column(name = "last_updated")
    private Date lastUpdated;

    // Default constructor
    public Leaderboard() {}

    // Constructor
    public Leaderboard(String entryId, String agentId, Integer rank, Double totalSales, Date lastUpdated) {
        this.entryId = entryId;
        this.agentId = agentId;
        this.rank = rank;
        this.totalSales = totalSales;
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEntryId() {
        return entryId;
    }

    public void setEntryId(String entryId) {
        this.entryId = entryId;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(Double totalSales) {
        this.totalSales = totalSales;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
