package com.AgentInsight.service;

import com.AgentInsight.dto.ResponceDTO.SaleResponseDTO;
import com.AgentInsight.entity.Sales;
import com.AgentInsight.entity.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface SalesService {

    List<Sales> getAllSales();
    Optional<Sales> getSaleById(String saleId);
    void addSale(Sales sale);
    void updateSale(Sales sale);
    Sales updateSaleStatus(String saleId, String status);
    void deleteSale(String saleid);
    List<SaleResponseDTO> getAllSaleWithDetails();
    Page<Sales> getAllSales(Pageable pageable);
    Page<SaleResponseDTO> getAllSaleWithDetails(Pageable pageable);
    Double getTotalSalesAmount();
    List<Users> getAgents();
}
