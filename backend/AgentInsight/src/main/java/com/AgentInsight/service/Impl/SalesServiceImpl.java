package com.AgentInsight.service.Impl;

import com.AgentInsight.dto.ResponceDTO.SaleResponseDTO;
import com.AgentInsight.entity.Sales;
import com.AgentInsight.entity.Users;
import com.AgentInsight.repository.PolicyRepository;
import com.AgentInsight.repository.SalesRepository;
import com.AgentInsight.repository.UserRepository;
import com.AgentInsight.service.IncentiveService;
import com.AgentInsight.service.SalesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SalesServiceImpl implements SalesService {

    private static final Logger logger = LoggerFactory.getLogger(SalesServiceImpl.class);

    private final SalesRepository salesRepository;

    private final UserRepository userRepository;

    private final PolicyRepository policyRepository;

    private final IncentiveService incentiveService;

    public SalesServiceImpl(SalesRepository salesRepository, UserRepository userRepository, PolicyRepository policyRepository, IncentiveService incentiveService){
        this.salesRepository=salesRepository;
        this.userRepository=userRepository;
        this.policyRepository=policyRepository;
        this.incentiveService=incentiveService;
    }

    @Override
    public List<Sales> getAllSales() {
        return salesRepository.findAll();
    }

    @Override
    public Optional<Sales> getSaleById(String saleId){
        return salesRepository.findById(saleId);
    }

    @Override
    @Transactional
    public void addSale(Sales sale) {
        salesRepository.save(sale);
        logger.info("Sale added: {}", sale.getSaleid());

        // If status is "Completed", calculate and create incentive
        if ("Completed".equalsIgnoreCase(sale.getStatus())) {
            logger.info("Sale {} added with Completed status, creating incentive", sale.getSaleid());
            try {
                incentiveService.calculateAndCreateIncentiveForSale(sale);
                logger.info("Incentive creation attempted for newly added sale {}", sale.getSaleid());
            } catch (Exception e) {
                logger.error("Failed to create incentive for newly added sale {}: {}", sale.getSaleid(), e.getMessage(), e);
                // Do not fail the sale addition
            }
        }
    }

    @Override
    public void updateSale(Sales sale){
        salesRepository.save(sale);
    }

    @Override
    public void deleteSale(String saleid){
        salesRepository.deleteById(saleid);
    }

    @Override
    public List<SaleResponseDTO> getAllSaleWithDetails() {
        // 1. Fetch the LIST of sales
        List<Sales> salesList = salesRepository.findAll();

        // 2. Map through each INDIVIDUAL sale object
        return salesList.stream().map(individualSale -> {
            SaleResponseDTO resp = new SaleResponseDTO();

            resp.setSaleid(individualSale.getSaleid());
            resp.setAmount(individualSale.getSaleamount());

            // Convert Long to String using String.valueOf()
            resp.setAgentid(String.valueOf(individualSale.getAgentid()));
            resp.setPolicyid(String.valueOf(individualSale.getPolicyid()));

            // Find names (ensure findById matches the ID type)
            String agentName = userRepository.findById(individualSale.getAgentid())
                    .map(Users::getName)
                    .orElse("Unknown Agent");
            resp.setAgentName(agentName);
            resp.setSaleDate(individualSale.getSaledate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
            resp.setStatus(individualSale.getStatus());

            return resp;
        }).collect(Collectors.toList());
    }

    @Override
    public Page<Sales> getAllSales(Pageable pageable) {
        return salesRepository.findAll(pageable);
    }

    @Override
    public Page<SaleResponseDTO> getAllSaleWithDetails(Pageable pageable) {
        Page<Sales> salesPage = salesRepository.findAll(pageable);
        return salesPage.map(individualSale -> {
            SaleResponseDTO resp = new SaleResponseDTO();
            resp.setSaleid(individualSale.getSaleid());
            resp.setAmount(individualSale.getSaleamount());
            resp.setAgentid(String.valueOf(individualSale.getAgentid()));
            resp.setPolicyid(String.valueOf(individualSale.getPolicyid()));
            String agentName = userRepository.findById(individualSale.getAgentid())
                    .map(Users::getName)
                    .orElse("Unknown Agent");
            resp.setAgentName(agentName);
            resp.setSaleDate(individualSale.getSaledate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
            resp.setStatus(individualSale.getStatus());
            return resp;
        });
    }

    @Override
    public Double getTotalSalesAmount() {
        Double total = salesRepository.getTotalSaleAmount();
        return total != null? total:0.0;
    }

    @Override
    public List<Users> getAgents(){
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public Sales updateSaleStatus(String saleId, String status) {
        logger.info("Updating sale {} to status {}", saleId, status);
        Optional<Sales> optionalSale = salesRepository.findById(saleId);
        if (optionalSale.isPresent()) {
            Sales sale = optionalSale.get();
            sale.setStatus(status);
            Sales updatedSale = salesRepository.save(sale);
            logger.info("Sale {} status updated to {}", saleId, status);

            // If status is "Completed", calculate and create incentive
            if ("Completed".equalsIgnoreCase(status)) {
                logger.info("Status is Completed, creating incentive for sale {}", saleId);
                try {
                    incentiveService.calculateAndCreateIncentiveForSale(updatedSale);
                    logger.info("Incentive creation attempted for sale {}", saleId);
                } catch (Exception e) {
                    logger.error("Failed to create incentive for sale {}: {}", saleId, e.getMessage(), e);
                    // Do not fail the sale update
                }
            }

            return updatedSale;
        } else {
            logger.error("Sale not found with id: {}", saleId);
            throw new RuntimeException("Sale not found with id: " + saleId);
        }
    }
}
