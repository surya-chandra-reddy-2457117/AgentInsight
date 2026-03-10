import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../../sidebar/sidebar';
import { AuthService } from '../../../services/auth.service';
import { Agent } from '../../../models/agent.model';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './agent-profile.html',
  styleUrl: './agent-profile.css',
})
export class AgentProfile implements OnInit {
  // Fix: Added the missing property for the template
  isReadOnly = true; 
  
  original: Agent | null = null;
  model: Agent = { agentid: '', name: '', email: '', phone: '', role: 'agent' };
  saving = false;
  message = '';

  roles = ['agent', 'admin'];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.loadUser(user.agentid);
    }
  }

  async loadUser(agentid: string): Promise<void> {
    const current = this.authService.currentUser();
    if (current) {
      this.original = { ...current };
      this.model = { ...current };
    }
  }

  async save(): Promise<void> {
    this.saving = true;
    this.message = '';
    try {
      const updated = await this.authService.updateUser(this.model);
      this.authService.setCurrentUser(updated);
      this.original = { ...updated };
      this.model = { ...updated };
      alert('Profile saved');
      
      
      // Fix: Lock the form again after successful save
      this.isReadOnly = true; 
    } catch (err) {
      console.error(err);
      alert('Failed to save');
      
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    if (this.original) {
      this.model = { ...this.original };
      alert('Failed to save');
      
    }
    // Fix: Lock the form when canceling
    this.isReadOnly = true;
  }

  // Optional: Helper method for the template button
  toggleEdit(): void {
    this.isReadOnly = !this.isReadOnly;
    if (!this.isReadOnly) {
      this.message = ''; // Clear status messages when starting to edit
    }
  }
}