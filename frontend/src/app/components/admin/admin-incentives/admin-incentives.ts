import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncentivesService } from '../../../services/incentives.service';

interface IncentiveWithDetails {
  incentiveid: string;
  agentid: string;
  agentName?: string;
  amount: number;
  bonus?: number;
  calculationdate: string;
  status: string;
}

@Component({
  selector: 'app-admin-incentives',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [IncentivesService],
  templateUrl: './admin-incentives.html',
  styleUrl: './admin-incentives.css'
})
export class AdminIncentives implements OnInit {
  incentives: IncentiveWithDetails[] = [];
  loading = true;
  updatingIncentiveId: string | null = null;
  selectedIncentive: IncentiveWithDetails | null = null;
  selectedStatus: string = '';
  statusOptions: string[] = ['Pending', 'Paid', 'Cancelled'];
  showModal: boolean = false;

  constructor(private incentivesService: IncentivesService) {}

  ngOnInit(): void {
    this.loadIncentives();
  }

  async loadIncentives(): Promise<void> {
    try {
      this.loading = true;
      this.incentives = await this.incentivesService.getAllIncentivesWithDetails();
    } catch (error) {
      console.error('Failed to load incentives', error);
    } finally {
      this.loading = false;
    }
  }

  openStatusModal(incentive: IncentiveWithDetails): void {
    this.selectedIncentive = incentive;
    this.selectedStatus = incentive.status;
    this.showModal = true;
  }

  closeStatusModal(): void {
    this.selectedIncentive = null;
    this.selectedStatus = '';
    this.showModal = false;
  }

  async confirmUpdate(): Promise<void> {
    if (!this.selectedIncentive || !this.selectedStatus || this.selectedStatus === this.selectedIncentive.status) {
      this.closeStatusModal();
      return;
    }

    try {
      this.updatingIncentiveId = this.selectedIncentive.incentiveid;
      await this.incentivesService.updateIncentiveStatus(this.selectedIncentive.incentiveid, this.selectedStatus);
      // Update local data
      this.selectedIncentive.status = this.selectedStatus;
      this.closeStatusModal();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status. Please try again.');
    } finally {
      this.updatingIncentiveId = null;
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
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
