import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SalesService } from '../../../services/sales.service';
import { IncentivesService } from '../../../services/incentives.service';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css']
})
export class Reports implements OnInit {
  reportForm: FormGroup;
  reportType: string = '';
  reportData: any[] = [];
  agentData: any[] = [];
  totalSales: number = 0;
  totalIncentives: number = 0;
  generatedDate: string = '';
  generatedTime: string = '';

  constructor(
    private fb: FormBuilder,
    private salesService: SalesService,
    private incentivesService: IncentivesService,
    private authService: AuthService
  ) {
    this.reportForm = this.fb.group({
      reportType: ['']
    });
  }

  ngOnInit(): void {}

  async generateReport(): Promise<void> {
    this.reportType = this.reportForm.value.reportType;
    const now = new Date();
    this.generatedDate = now.toLocaleDateString();
    this.generatedTime = now.toLocaleTimeString();

    if (this.reportType === 'sales') {
      await this.generateSalesReport();
    } else if (this.reportType === 'agent') {
      await this.generateAgentReport();
    } else if (this.reportType === 'incentives') {
      await this.generateIncentivesReport();
    }
  }

  async generateSalesReport(): Promise<void> {
    try {
      const sales = await this.salesService.getAllSalesWithDetails();
      this.reportData = sales;
      this.totalSales = await this.salesService.getTotalSalesAmount();
    } catch (error) {
      console.error('Error generating sales report:', error);
    }
  }

  async generateAgentReport(): Promise<void> {
    try {
      const agents = await this.salesService.getAgents();
      const sales = await this.salesService.getSales();
      const incentives = await this.incentivesService.getIncentives();

      this.agentData = agents.filter((user: any) => user.role === 'agent').map((agent: any) => {
        const agentSales = sales.filter((sale: any) => sale.agentid === agent.agentid);
        const agentIncentives = incentives.filter((inc: any) => inc.agentid === agent.agentid);
        return {
          agentid: agent.agentid,
          name: agent.name,
          totalSales: agentSales.reduce((sum: number, sale: any) => sum + sale.saleamount, 0),
          totalIncentives: agentIncentives.reduce((sum: number, inc: any) => sum + inc.amount, 0),
          salesCount: agentSales.length,
          incentivesCount: agentIncentives.length
        };
      });
    } catch (error) {
      console.error('Error generating agent report:', error);
    }
  }

  async generateIncentivesReport(): Promise<void> {
    try {
      const incentives = await this.incentivesService.getIncentives();
      this.reportData = incentives;
      this.totalIncentives = incentives.reduce((sum: number, inc: any) => sum + inc.amount, 0);
    } catch (error) {
      console.error('Error generating incentives report:', error);
    }
  }

  getReportTitle(): string {
    switch (this.reportType) {
      case 'sales':
        return 'Sales Report';
      case 'agent':
        return 'Agent Performance Report';
      case 'incentives':
        return 'Incentives Report';
      default:
        return 'Report';
    }
  }

  downloadReport(): void {
    // Placeholder for download functionality
    alert('Download functionality not implemented yet.');
  }



}
