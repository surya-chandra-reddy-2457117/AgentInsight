
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Agent } from '../../../models/agent.model';
import { AgentService } from '../../../services/agent.service';

@Component({
  selector: 'app-agent-management',
  standalone: true, // If you're using standalone components (Angular 14+)
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-management.html',
  styleUrls: ['./agent-management.css'], // <-- fixed: styleUrls (plural)
})
export class AgentManagement implements OnInit {
  agents: Agent[] = [];
  selectedAgent: Agent = { agentid: '', name: '', email: '', phone: '', role: '' };

  // Patterns
  namePattern: string = '^[A-Za-z . ]+$';       // alphabets + spaces only
  agentIdPattern: string = '^A-\\d{3}$';      // A-### (e.g., A-123)
  phonePattern: string = '^(\\d{10})$';       // exactly 10 digits, numeric only

  isEditing = false; // controls visibility of the edit form
  isNew = false;     // distinguishes add vs edit
  formSubmitted = false;
  emailExists = false; // flag to track email uniqueness errors
  agentIdExists = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private agentService: AgentService) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  async loadAgents(): Promise<void> {
    try {
      this.agents = await this.agentService.getAgents();
    } catch (error) {
      console.error('Failed to load agents', error);
    }
  }

  addAgent(): void {
    // Role fixed as 'Agent' for NEW agents
    this.selectedAgent = { agentid: '', name: '', email: '', phone: '', role: 'Agent' };
    this.isEditing = true;
    this.isNew = true;
    this.formSubmitted = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.emailExists = false;
    this.agentIdExists = false;
  }

  editAgent(agent: Agent): void {
    // Clone the agent to avoid mutating the list directly
    this.selectedAgent = { ...agent };
    this.isEditing = true;
    this.isNew = false;
    this.formSubmitted = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.emailExists = false;
    this.agentIdExists = false;
  }

  async saveAgent(): Promise<void> {
    this.formSubmitted = true;
    this.errorMessage = '';

    // Ensure latest uniqueness flags are set before validations
    this.validateAgentIdUniqueness();
    this.validateEmailUniqueness();

    // Validate required fields
    if (!this.selectedAgent.agentid?.trim()) {
      this.errorMessage = 'Agent ID is required';
      return;
    }

    // Agent ID format check: A-###
    if (!this.isValidAgentIdFormat(this.selectedAgent.agentid)) {
      this.errorMessage = 'Agent ID must be in the format A-### (e.g., A-123)';
      return;
    }

    if (this.agentIdExists) {
      this.errorMessage = 'Agent ID already exists';
      return;
    }

    if (!this.selectedAgent.name?.trim()) {
      this.errorMessage = 'Name is required';
      return;
    }

    // Name should be alphabets only
    if (!this.isValidName(this.selectedAgent.name)) {
      this.errorMessage = 'Name must contain alphabets only';
      return;
    }

    if (!this.selectedAgent.email?.trim()) {
      this.errorMessage = 'Email is required';
      return;
    }

    if (!this.isValidEmail(this.selectedAgent.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (this.emailExists) {
      this.errorMessage = 'Email already exists';
      return;
    }

    // Phone: exactly 10 digits (optional field)
    if (this.selectedAgent.phone?.trim() && !this.isValidPhone(this.selectedAgent.phone)) {
      this.errorMessage = 'Phone must be exactly 10 digits, numeric only';
      return;
    }

    try {
      if (this.isNew) {
        // Ensure role is fixed as 'Agent' on create
        const { agentid, ...newAgentData } = this.selectedAgent;
        const created = await this.agentService.createAgent(newAgentData, agentid);

        this.successMessage = `Agent created successfully with ID: ${created.agentid}`;
        console.log('Agent created:', created);
        setTimeout(() => this.successMessage = '', 3000);
      } else {
        // For update (role is not edited via UI; keep as-is)
        await this.agentService.updateAgent(this.selectedAgent);
        this.successMessage = 'Agent updated successfully';
        console.log('Agent updated successfully');
        setTimeout(() => this.successMessage = '', 3000);
      }

      // Refresh list and exit edit mode
      this.cancelEdit();
      await this.loadAgents();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Failed to save agent';
      console.error('Failed to save agent', error);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test((email || '').trim());
  }

  private isValidName(name: string): boolean {
    const nameRegex = /^[A-Za-z . ]+$/;
    return nameRegex.test((name || '').trim());
  }

  private isValidAgentIdFormat(agentid: string): boolean {
    const idRegex = /^A-\d{3}$/;
    return idRegex.test((agentid || '').trim());
  }

  private isEmailUnique(email: string): boolean {
    const normalized = (email || '').trim().toLowerCase();
    if (!normalized) return true; // empty email is handled by required check; treat as unique here
    // Check if email already exists in the list (excluding current agent during edit)
    return !this.agents.some(agent =>
      (agent.email || '').toLowerCase() === normalized &&
      agent.agentid !== this.selectedAgent.agentid
    );
  }

  validateEmailUniqueness(): void {
    const email = (this.selectedAgent.email || '').trim();
    if (!email) {
      this.emailExists = false;
      return;
    }
    this.emailExists = !this.isEmailUnique(email);
  }

  private isAgentIdUnique(agentid: string): boolean {
    const normalized = (agentid || '').trim().toLowerCase();
    return !this.agents.some(agent =>
      (agent.agentid || '').toLowerCase() === normalized &&
      agent.agentid !== this.selectedAgent.agentid
    );
  }

  validateAgentIdUniqueness(): void {
    // Only check uniqueness if format is valid
    if (!this.isValidAgentIdFormat(this.selectedAgent.agentid)) {
      this.agentIdExists = false;
      return;
    }
    if (this.isNew) {
      this.agentIdExists = !this.isAgentIdUnique(this.selectedAgent.agentid);
    } else {
      // During edit, do not flag if the ID is unchanged
      this.agentIdExists = false;
    }
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/; // exactly 10 digits
    return phoneRegex.test((phone || '').trim());
  }

  async deleteAgent(agentid: string): Promise<void> {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await this.agentService.deleteAgent(agentid);
        console.log('Agent deleted successfully');
        await this.loadAgents();
      } catch (error) {
        console.error('Failed to delete agent', error);
      }
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isNew = false;
    this.formSubmitted = false;
    this.emailExists = false;
    this.agentIdExists = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedAgent = { agentid: '', name: '', email: '', phone: '', role: '' };
  }

  // Optional: trackBy for better rendering performance
   trackByAgentId(index: number, agent: Agent): string {
    return agent.agentid ?? `${index}`;
  }
}