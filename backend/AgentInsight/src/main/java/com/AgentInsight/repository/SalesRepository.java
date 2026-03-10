package com.AgentInsight.repository;

import com.AgentInsight.entity.Sales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SalesRepository extends JpaRepository<Sales,String > {
    @Query("SELECT SUM(s.saleamount) from Sales s")
    Double getTotalSaleAmount();

    Sales findBySaleid(String saleid);
    List<Sales> findByAgentid(String agentid);
}
