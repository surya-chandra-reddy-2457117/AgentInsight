import { Injectable, inject, Optional } from '@angular/core'; // Imports necessary Angular core modules for dependency injection.
import { Incentive } from '../models/incentive.model'; // Imports the Incentive model for type definitions.
import { SalesService } from './sales.service'; // Imports SalesService for agent data access.
import { firstValueFrom } from 'rxjs'; // Imports firstValueFrom to convert observables to promises.
import { HttpClient, HttpParams } from '@angular/common/http'; // Imports HttpClient and HttpParams for HTTP requests.

@Injectable({ // Decorator to make the class injectable as a service.
  providedIn: 'root' // Provides the service at the root level.
})
export class IncentivesService { // Main service class for handling incentives.
  private salesService = inject(SalesService); // Injects SalesService using the inject function.
  private apiUrl = 'http://localhost:3000'; // Base URL for API calls.

  constructor(@Optional() private http?: HttpClient) {} // Constructor with optional HttpClient dependency.

  // Private method to build query parameters for HTTP requests.
  private qsParams(paramsObj?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!paramsObj) return undefined;
    return new HttpParams({ fromObject: Object.entries(paramsObj).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}) });
  }

  // Private async method for GET requests with fallback to fetch.
  private async get<T>(path: string, paramsObj?: Record<string, string | number | boolean>): Promise<T> {
    if (this.http) {
      try {
        return await firstValueFrom(this.http.get<T>(`${this.apiUrl}${path}`, { params: this.qsParams(paramsObj) }));
      } catch (err) {
        console.error(`GET ${path} failed (HttpClient)`, err);
        throw err;
      }
    }

    // fetch fallback
    const qs = paramsObj ? '?' + Object.entries(paramsObj).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&') : '';
    const res = await fetch(`${this.apiUrl}${path}${qs}`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GET ${path} failed (fetch) - ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  }

  // Private async method for PATCH requests with fallback to fetch.
  private async patch<T>(path: string, body: any): Promise<T> {
    if (this.http) {
      try {
        return await firstValueFrom(this.http.patch<T>(`${this.apiUrl}${path}`, body));
      } catch (err) {
        console.error(`PATCH ${path} failed (HttpClient)`, err);
        throw err;
      }
    }

    const res = await fetch(`${this.apiUrl}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`PATCH ${path} failed (fetch) - ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  }

  // Private async method for POST requests with fallback to fetch.
  private async post<T>(path: string, body: any): Promise<T> {
    if (this.http) {
      try {
        return await firstValueFrom(this.http.post<T>(`${this.apiUrl}${path}`, body));
      } catch (err) {
        console.error(`POST ${path} failed (HttpClient)`, err);
        throw err;
      }
    }

    const res = await fetch(`${this.apiUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`POST ${path} failed (fetch) - ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  }

  /**
   * Get incentives from API with agent details.
   */
  async getAllIncentivesWithDetails(): Promise<Array<Incentive & { bonus?: number; agentName?: string }>> { // Method to retrieve all incentives with additional details like bonus and agent name.
    const incentives = await this.get<Incentive[]>('/incentives'); // Fetches incentives from API.
    const agents = await this.salesService.getAgents(); // Gets agents from SalesService.

    return incentives.map((i: any) => { // Maps over incentives to add bonus and agent name.
      const amount = +(i.amount || 0); // Converts amount to number.
      const bonus = +((amount * 0.1).toFixed(2)); // Calculates 10% bonus.
      return {
        ...i,
        bonus, // Adds bonus to the incentive object.
        agentName: agents.find((a: any) => a.agentid === i.agentid)?.name || i.agentid // Finds agent name or uses agentid.
      };
    });
  }

  /**
   * Get total base amount from completed sales
   */
  async getTotalIncentivesAmount(): Promise<number> { // Method to calculate total incentives amount.
    const incentives = await this.getAllIncentivesWithDetails(); // Gets detailed incentives.
    return incentives.reduce((sum, i) => sum + (i.amount || 0), 0); // Sums up the amounts.
  }

  /**
   * ✅ Get total BONUS amount (10% of completed sales)
   */
  async getTotalBonusAmount(): Promise<number> { // Method to calculate total bonus amount.
    const incentives = await this.getAllIncentivesWithDetails(); // Gets detailed incentives.
    return incentives.reduce((sum, i) => sum + (i.bonus || 0), 0); // Sums up the bonuses.
  }

  async getPendingCount(): Promise<number> { // Method to count pending incentives.
    const incentives = await this.getAllIncentivesWithDetails(); // Gets detailed incentives.
    return (incentives || []).filter(i => i.status === 'Pending').length; // Filters and counts pending ones.
  }

  async getIncentivesByAgentId(agentid: string): Promise<Incentive[]> { // Method to get incentives for a specific agent.
    const incentives = await this.getAllIncentivesWithDetails(); // Gets detailed incentives.
    return incentives.filter(i => i.agentid === agentid); // Filters by agentid.
  }

  async getAgents(): Promise<any[]> { // Method to get all agents.
    return this.salesService.getAgents(); // Delegates to SalesService.
  }

  async getIncentives(): Promise<Incentive[]> { // Method to get all incentives without extra details.
    const incentives = await this.getAllIncentivesWithDetails(); // Gets detailed incentives.
    return incentives.map(i => ({ // Maps to basic incentive properties.
      incentiveid: i.incentiveid,
      agentid: i.agentid,
      amount: i.amount,
      calculationdate: i.calculationdate,
      status: i.status
    }));
  }

  /**
   * Get incentive by incentiveid
   */
  async getIncentiveByIncentiveId(incentiveid: string): Promise<Incentive | null> { // Method to find a specific incentive by id.
    try {
      const incentives = await this.get<Incentive[]>('/incentives', { incentiveid }); // Fetches incentives by id.
      return (incentives || [])[0] || null; // Returns the first one or null.
    } catch (err) {
      console.error('getIncentiveByIncentiveId error', err); // Logs error.
      return null; // Returns null on error.
    }
  }

  /**
   * Create incentive
   */
  async createIncentive(incentive: Omit<Incentive, 'id'>): Promise<Incentive> { // Method to create a new incentive.
    try {
      return await this.post<Incentive>('/incentives', incentive); // Posts the new incentive.
    } catch (err) {
      console.error('createIncentive error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }

  /**
   * Update incentive status
   */
  async updateIncentiveStatus(incentiveid: string, status: string): Promise<Incentive> { // Method to update incentive status.
    try {
      const incentives = await this.get<Incentive[]>('/incentives', { incentiveid }); // Fetches incentives by id.
      const existing = (incentives || [])[0]; // Gets the first one.
      if (!existing || (existing as any).id === undefined) { // Checks if exists.
        throw new Error(`Incentive not found for incentiveid ${incentiveid}`); // Throws error if not found.
      }
      const id = (existing as any).id; // Gets the internal id.
      return await this.patch<Incentive>(`/incentives/${id}`, { status }); // Patches the status.
    } catch (err) {
      console.error('updateIncentiveStatus error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }
}
