import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../sidebar/sidebar';
import { SalesService } from '../../../services/sales.service';
import { Sale } from '../../../models/sale.model';
import { Agent } from '../../../models/agent.model';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

interface SalesWithDetails extends Sale {
  agentName?: string;
  policyName?: string;
}

interface Policy {
  policyid: string;
  name: string;
}

@Component({
  selector: 'app-agent-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './agent-sales.html',
  styleUrl: './agent-sales.css'
})
export class AgentSales implements OnInit {
  policies: Policy[] = [];
  sales: SalesWithDetails[] = [];
  agents: Agent[] = [];

  totalsales = 0;
  conversionRate = 0;

  // Basic pagination
  page = 1;
  pageSize = 6;

  loading = true;

  currentAgentId = '';

  // Modal state
  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  formSubmitting = signal<boolean>(false);

  // Form model
  formData: Omit<Sale, 'saleid' | 'status'> & { saleid?: string } = {
    policyid: '',
    agentid: '',
    saleamount: 0,
    saletype: 'New',
    saledate: ''
  };

  originalSale: SalesWithDetails | null = null;

  constructor(
    private salesService: SalesService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const user = this.authService.currentUser();
      if (user) this.currentAgentId = user.agentid;
      await this.loadSalesData();
    } catch (err) {
      console.error('ngOnInit error', err);
      this.toast.show('Failed to initialize', 'error');
    }
  }

  private async loadSalesData(): Promise<void> {
    try {
      this.loading = true;

      // Load policies
      this.policies = await this.salesService.getPolicies();

      // Load agents
      this.agents = await this.salesService.getAgents();

      // Load sales with details for current agent only
      const allSales = await this.salesService.getAllSalesWithDetails();
      this.sales = allSales.filter(sale => sale.agentid === this.currentAgentId);

      // Calculate aggregates for current agent
      this.totalsales = this.sales.reduce((sum, sale) => sum + (sale.saleamount || 0), 0);
      this.conversionRate = await this.salesService.getConversionRate();
      // ensure current page still valid
      if ((this.page - 1) * this.pageSize >= this.sales.length) {
        this.page = 1;
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      this.toast.show('Failed to load sales', 'error');
    } finally {
      this.loading = false;
    }
  }

  // ✅ Open Add Sale Modal
  openAddModal(): void {
    this.isEditMode.set(false);
    this.formData = {
      policyid: this.policies[0]?.policyid || '',
      agentid: this.currentAgentId,
      saleamount: 0,
      saletype: 'New',
      saledate: new Date().toISOString().split('T')[0]
    };
    this.showModal.set(true);
  }

  // ✅ Open Edit Modal
  openEditModal(sale: SalesWithDetails): void {
    this.isEditMode.set(true);
    this.originalSale = sale;
    this.formData = {
      saleid: sale.saleid,
      policyid: sale.policyid,
      agentid: sale.agentid,
      saleamount: sale.saleamount,
      saletype: sale.saletype,
      saledate: sale.saledate
    };
    this.showModal.set(true);
  }

  // ✅ Close Modal
  closeModal(): void {
    this.showModal.set(false);
    this.formSubmitting.set(false);
    this.resetForm();
  }

  // ✅ Reset Form
  private resetForm(): void {
    this.formData = {
      policyid: this.policies[0]?.policyid || '',
      agentid: this.currentAgentId,
      saleamount: 0,
      saletype: 'New',
      saledate: new Date().toISOString().split('T')[0]
    };
  }

  // ✅ Submit Form (Add or Update)
  async submitForm(): Promise<void> {
    // Validation
    if (!this.formData.policyid || !this.formData.saleamount || !this.formData.saledate) {
      this.toast.show('Please fill all required fields', 'error');
      return;
    }

    this.formSubmitting.set(true);

    try {
      if (this.isEditMode()) {
        // Update existing sale
        if (!this.formData.saleid) {
          throw new Error('Sale ID is missing');
        }
        const saleToUpdate: Sale = {
          saleid: this.formData.saleid,
          policyid: this.formData.policyid,
          agentid: this.formData.agentid,
          saleamount: this.formData.saleamount,
          saletype: this.formData.saletype,
          saledate: this.formData.saledate,
          status: this.originalSale?.status || 'Pending'
        };
        await this.salesService.updateSale(saleToUpdate);
        this.toast.show('Sale updated successfully', 'success');
      } else {
        // Create new sale
        const salePayload: Omit<Sale, 'saleid'> = {
          policyid: this.formData.policyid,
          agentid: this.formData.agentid,
          saleamount: this.formData.saleamount,
          saletype: this.formData.saletype,
          saledate: this.formData.saledate,
          status: 'Pending'
        };
        await this.salesService.createSale(salePayload);
        this.toast.show('Sale added successfully', 'success');
      }

      // Reload data and close modal
      await this.loadSalesData();
      this.closeModal();
    } catch (err) {
      console.error('Form submission error', err);
      this.toast.show(
        this.isEditMode() ? 'Failed to update sale' : 'Failed to add sale',
        'error'
      );
    } finally {
      this.formSubmitting.set(false);
    }
  }

  async deleteSale(s: SalesWithDetails): Promise<void> {
    if (!confirm(`Delete sale ${s.saleid}?`)) return;
    try {
      this.loading = true;
      await this.salesService.deleteSale(s.saleid || '');
      await this.loadSalesData();
      this.toast.show(`Sale ${s.saleid} deleted`, 'success');
    } catch (err) {
      console.error('Failed to delete sale', err);
      this.toast.show('Failed to delete sale', 'error');
    } finally {
      this.loading = false;
    }
  }

  getPolicyName(policyid: string): string {
    const p = this.policies.find((x) => x.policyid === policyid);
    return p ? p.name : policyid;
  }

  getAgentName(agentid: string): string {
    const a = this.agents.find((x) => x.agentid === agentid);
    return a ? a.name : agentid;
  }

  // pagination helpers
  get pagedSales(): SalesWithDetails[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sales.slice(start, start + this.pageSize);
  }

  prevPage(): void {
    if (this.page > 1) this.page--;
  }
  nextPage(): void {
    if (this.page * this.pageSize < this.sales.length) this.page++;
  }
}
