package com.AgentInsight.dto;

import com.AgentInsight.entity.Sales;

import java.util.List;

public class AgentPerformanceDTO {
    private String agentid;
    private String name;
    private String email;
    private String phone;
    private List<Sales> sales;
    private List<IncentiveDto> incentives;
    private Double totalSales;
    private Double totalIncentives;

    // AgentPerformanceDto.java
    public AgentPerformanceDTO(
            String agentid,
            String name,
            String email,
            String phone,
            List<Sales> sales,
            List<IncentiveDto> incentives,
            Double totalSales,
            Double totalIncentives
    ) {
        this.agentid = agentid;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.sales = sales;
        this.incentives = incentives;
        this.totalSales = totalSales;
        this.totalIncentives = totalIncentives;
    }

    @Override
    public String toString() {
        return "AgentPerformanceDTO{" +
                "agentid='" + agentid + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", sales=" + sales +
                ", incentives=" + incentives +
                ", totalSales=" + totalSales +
                ", totalIncentives=" + totalIncentives +
                '}';
    }

    public AgentPerformanceDTO() {
    }

    public String getAgentid() {
        return agentid;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public List<Sales> getSales() {
        return sales;
    }

    public List<IncentiveDto> getIncentives() {
        return incentives;
    }

    public Double getTotalSales() {
        return totalSales;
    }

    public Double getTotalIncentives() {
        return totalIncentives;
    }




}
