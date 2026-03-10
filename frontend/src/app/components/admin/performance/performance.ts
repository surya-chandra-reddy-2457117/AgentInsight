import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AdminSidebar } from "../admin-sidebar/admin-sidebar";
import { SalesService } from '../../../services/sales.service';
import { IncentivesService } from '../../../services/incentives.service';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminSidebar],
  templateUrl: './performance.html',
  styleUrls: ['./performance.css'],
})
export class Performance implements OnInit {
  filterForm: FormGroup;
  allAgents: any[] = [];
  allSales: any[] = [];
  allIncentives: any[] = [];
  selectedAgent: any;
  agentSales: any[] = [];
  agentIncentives: any[] = [];
  totalAgentSales: number = 0;
  totalAgentIncentives: number = 0;

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private incentivesService: IncentivesService
  ) {
    this.filterForm = this.fb.group({
      agentId: ['']
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      this.allAgents = await this.salesService.getAgents();
      this.allSales = await this.salesService.getSales();
      this.allIncentives = await this.incentivesService.getAllIncentivesWithDetails();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  applyFilters(): void {
    const agentId = this.filterForm.value.agentId?.trim();
    if (!agentId) {
      this.selectedAgent = null;
      this.agentSales = [];
      this.agentIncentives = [];
      this.totalAgentSales = 0;
      this.totalAgentIncentives = 0;
      return;
    }

    this.selectedAgent = this.allAgents.find(agent => agent.agentid === agentId);
    if (!this.selectedAgent) {
      alert('Agent not found');
      return;
    }

    this.agentSales = this.allSales.filter(sale => sale.agentid === agentId);
    this.agentIncentives = this.allIncentives.filter(inc => inc.agentid === agentId);

    this.totalAgentSales = this.agentSales.reduce((sum, sale) => sum + (sale.saleamount || 0), 0);
    this.totalAgentIncentives = this.agentIncentives.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  }
}
