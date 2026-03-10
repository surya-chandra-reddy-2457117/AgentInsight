import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../sidebar/sidebar';
import { LeaderboardService } from '../../../services/leaderboard.service';
import { LeaderboardEntry, Badge } from '../../../models/leaderboard.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-agent-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './agent-leaderboard.html',
  styleUrl: './agent-leaderboard.css'
})
export class AgentLeaderboard implements OnInit {
  leaderboardEntries: any[] = [];
  selectedDate: string = '';
  availableDates: string[] = ['2024-04', '2024-03', '2024-02', '2024-01'];

  currentAgentId = '';

  constructor(private leaderboardService: LeaderboardService, private authService: AuthService) {}

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user) this.currentAgentId = user.agentid;
    await this.loadLeaderboard();
  }

  async loadLeaderboard() {
    try {
      this.leaderboardEntries = await this.leaderboardService.getLeaderboardEntriesWithDetails();
      // Mark current agent's entry
      this.leaderboardEntries = this.leaderboardEntries.map(entry => ({
        ...entry,
        isCurrentAgent: entry.agentId === this.currentAgentId
      }));
      console.log('Leaderboard entries loaded:', this.leaderboardEntries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }

  onDateChange() {
    // Filter data based on selected date if needed
    // For now, just reload all data
    this.loadLeaderboard();
  }

  getRankIcon(rank: number): string {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  }

  trackByEntryId(index: number, item: any): string {
    return item.entryId;
  }
}
