import { Injectable, Optional } from '@angular/core'; // Imports Injectable and Optional decorators from Angular core for dependency injection.
import { Sale } from '../models/sale.model'; // Imports the Sale model for type definitions.
import { Agent } from '../models/agent.model'; // Imports the Agent model for type definitions.
import { Incentive } from '../models/incentive.model'; // Imports the Incentive model for type definitions.
import { IncentivesService } from './incentives.service'; // Imports IncentivesService for incentive management.
import { firstValueFrom } from 'rxjs'; // Imports firstValueFrom to convert observables to promises.
import { HttpClient, HttpParams } from '@angular/common/http'; // Imports HttpClient and HttpParams for HTTP requests.

@Injectable({ // Decorator to make the class injectable as a service.
  providedIn: 'root' // Provides the service at the root level.
})
export class AdminSalesService { // Main service class for admin sales operations.
  private apiUrl = 'http://localhost:3000'; // Base URL for API calls.

  constructor(@Optional() private http?: HttpClient, @Optional() private incentivesService?: IncentivesService) {} // Constructor with optional HttpClient and IncentivesService dependencies.

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

  /**
   * Get all sales with agent details for admin view
   */
  async getAllSalesWithAgentDetails(): Promise<any[]> { // Method to retrieve all sales with agent details.
    const sales = await this.get<Sale[]>('/sales'); // Fetches sales data.
    const agents = await this.get<Agent[]>('/users'); // Fetches agents data.

    return (sales || []).map((sale) => ({ // Maps sales to include agent names.
      ...sale,
      agentName: agents.find((a) => a.agentid === sale.agentid)?.name || 'Unknown Agent' // Finds agent name or defaults.
    }));
  }

  /**
   * Update sale status
   */
  async updateSaleStatus(saleid: string, status: string): Promise<Sale> { // Method to update sale status and potentially create incentive.
    try {
      const sales = await this.get<Sale[]>('/sales', { saleid }); // Fetches sale by ID.
      const existing = (sales || [])[0]; // Gets the existing sale.
      if (!existing || (existing as any).id === undefined) { // Checks if sale exists.
        throw new Error(`Sale not found for saleid ${saleid}`); // Throws error if not found.
      }
      const id = (existing as any).id; // Extracts internal ID.
      const updatedSale = await this.patch<Sale>(`/sales/${id}`, { status }); // Updates sale status.

      // If status changed to Completed, create incentive if not exists
      if (status === 'Completed' && this.incentivesService) { // Checks for status change and service availability.
        const incentiveid = `I-${saleid}`; // Generates incentive ID.
        const existingIncentive = await this.incentivesService.getIncentiveByIncentiveId(incentiveid); // Checks for existing incentive.
        if (!existingIncentive) { // If not exists, creates new incentive.
          await this.incentivesService.createIncentive({
            incentiveid,
            agentid: existing.agentid,
            amount: existing.saleamount,
            calculationdate: existing.saledate,
            status: 'Pending'
          });
        }
      }

      return updatedSale; // Returns updated sale.
    } catch (err) {
      console.error('updateSaleStatus error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }
}
