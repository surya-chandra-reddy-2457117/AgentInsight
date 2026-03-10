package com.AgentInsight.entity;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name="sales")
public class Sales {
    @Id
    @Column(name="saleid")
    private String saleid;
    @Column(name="policyid")
    private String policyid;
    @Column(name="agentid")
    private String agentid;
    @Column(name="saleamount")
    private Double saleamount;
    @Column(name="saletype")
    private String saletype;
    @Column(name="saledate")
    private Date saledate;
    @Column(name="status")
    private String status;

    public Sales(){}

    public Sales(String saleid, String policyid, String agentid, Double saleamount, String saletype, Date saledate, String status) {
        this.saleid = saleid;
        this.policyid = policyid;
        this.agentid = agentid;
        this.saleamount = saleamount;
        this.saletype = saletype;
        this.saledate = saledate;
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getSaledate() {
        return saledate;
    }

    public void setSaledate(Date saledate) {
        this.saledate = saledate;
    }

    public String getSaletype() {
        return saletype;
    }

    public void setSaletype(String saletype) {
        this.saletype = saletype;
    }

    public Double getSaleamount() {
        return saleamount;
    }

    public void setSaleamount(Double saleamount) {
        this.saleamount = saleamount;
    }

    public String getAgentid() {
        return agentid;
    }

    public void setAgentid(String agentid) {
        this.agentid = agentid;
    }

    public String getPolicyid() {
        return policyid;
    }

    public void setPolicyid(String policyid) {
        this.policyid = policyid;
    }

    public String getSaleid() {
        return saleid;
    }

    public void setSaleid(String saleid) {
        this.saleid = saleid;
    }
}
