import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSalesService } from '../../../services/admin-sales.service';

interface SaleWithAgent {
  saleid: string;
  agentid: string;
  agentName: string;
  saleamount: number;
  saledate: string;
  status: string;
}

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AdminSalesService],
  templateUrl: './admin-sales.html',
  styleUrl: './admin-sales.css'
})
export class AdminSales implements OnInit {
  sales: SaleWithAgent[] = [];
  loading = true;
  updatingSaleId: string | null = null;
  selectedSale: SaleWithAgent | null = null;
  selectedStatus: string = '';
  statusOptions: string[] = ['Pending', 'Completed', 'Cancelled'];
  showModal: boolean = false;

  constructor(private adminSalesService: AdminSalesService) {}

  ngOnInit(): void {
    this.loadSales();
  }

  async loadSales(): Promise<void> {
    try {
      this.loading = true;
      this.sales = await this.adminSalesService.getAllSalesWithAgentDetails();
    } catch (error) {
      console.error('Failed to load sales', error);
    } finally {
      this.loading = false;
    }
  }

  openStatusModal(sale: SaleWithAgent): void {
    this.selectedSale = sale;
    this.selectedStatus = sale.status;
    this.showModal = true;
  }

  closeStatusModal(): void {
    this.selectedSale = null;
    this.selectedStatus = '';
    this.showModal = false;
  }

  async confirmUpdate(): Promise<void> {
    if (!this.selectedSale || !this.selectedStatus || this.selectedStatus === this.selectedSale.status) {
      this.closeStatusModal();
      return;
    }

    try {
      this.updatingSaleId = this.selectedSale.saleid;
      await this.adminSalesService.updateSaleStatus(this.selectedSale.saleid, this.selectedStatus);
      // Update local data
      this.selectedSale.status = this.selectedStatus;
      this.closeStatusModal();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status. Please try again.');
    } finally {
      this.updatingSaleId = null;
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'pending':
        return 'bg-warning text-dark';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
}
