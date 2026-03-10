package com.AgentInsight.controller;

import com.AgentInsight.dto.ResponceDTO.SaleResponseDTO;
import com.AgentInsight.entity.Sales;
import com.AgentInsight.entity.Users;
import com.AgentInsight.service.SalesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/sales")
public class SalesController {
    private static final Logger logger = LoggerFactory.getLogger(SalesController.class);
    private final SalesService salesService;

    public  SalesController(SalesService salesService){
        this.salesService=salesService;
        logger.info("SalesController initialized");
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<Sales> getAllSales(){
        logger.info("getAllSales called");
        return salesService.getAllSales();
    }

    @GetMapping("/test")
    public String test(){
        return "Backend is running";
    }


    @GetMapping("/{saleId}")
    public ResponseEntity<Sales> getSaleById(@PathVariable String saleId){
        return salesService.getSaleById(saleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/addsales")
//    @PreAuthorize("hasRole('ADMIN')")
    public void addSale(@RequestBody Sales sale){
        salesService.addSale(sale);
//        return "Sale adding";
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/updatesale")
    public void updateSale(@RequestBody Sales sale){
        salesService.updateSale(sale);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<Sales> updateSaleStatus(@PathVariable String id, @RequestBody Map<String, String> statusUpdate) {
        try {
            String status = statusUpdate.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().build();
            }
            logger.info("Updating sale " + id + " to status " + status);
            Sales updatedSale = salesService.updateSaleStatus(id, status);
            logger.info("Sale " + id + " updated successfully to " + updatedSale.getStatus());
            return ResponseEntity.ok(updatedSale);
        } catch (Exception e) {
            logger.error("Error updating sale " + id + ": " + e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/deletesale/{saleid}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteSale(@PathVariable String saleid){
        salesService.deleteSale(saleid);
    }

    @GetMapping("/salesdetails")
    public ResponseEntity<List<SaleResponseDTO>> getAllSalesDetails(){
        return ResponseEntity.ok(salesService.getAllSaleWithDetails());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/salesdetails/paginated")
    public ResponseEntity<Page<SaleResponseDTO>> getAllSalesDetailsPaginated(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SaleResponseDTO> sales = salesService.getAllSaleWithDetails(pageable);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/gettotalsaleamount")
    @PreAuthorize("hasRole('ADMIN')")
    public Double getTotalSaleAmount(){
        return salesService.getTotalSalesAmount();
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Users> getAgents(){
        return salesService.getAgents();
    }


}
