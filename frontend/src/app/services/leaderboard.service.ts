import { Injectable, Optional } from '@angular/core'; // Imports Injectable and Optional decorators from Angular core for dependency injection.
import { LeaderboardEntry } from '../models/leaderboard.model'; // Imports LeaderboardEntry model for type definitions.
import { Sale } from '../models/sale.model'; // Imports Sale model for type definitions related to sales data.
import { firstValueFrom } from 'rxjs'; // Imports firstValueFrom to convert observables to promises.
import { HttpClient, HttpParams } from '@angular/common/http'; // Imports HttpClient and HttpParams for HTTP requests.

@Injectable({ // Decorator to make the class injectable as a service.
  providedIn: 'root' // Provides the service at the root level.
})
export class LeaderboardService { // Main service class for handling leaderboard and badge operations.
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

  // Private async method for DELETE requests with fallback to fetch.
  private async deleteReq<T>(path: string): Promise<T> {
    if (this.http) {
      try {
        return await firstValueFrom(this.http.delete<T>(`${this.apiUrl}${path}`));
      } catch (err) {
        console.error(`DELETE ${path} failed (HttpClient)`, err);
        throw err;
      }
    }

    const res = await fetch(`${this.apiUrl}${path}`, { method: 'DELETE' });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`DELETE ${path} failed (fetch) - ${res.status} ${res.statusText} ${text}`);
    }
    // some deletes return empty body
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? (await res.json()) as T : (undefined as unknown as T);
  }

  /**
   * Get all leaderboard entries (generated from sales totals so it matches the dashboard)
   */
  async getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
    // Generate leaderboard dynamically from sales so totals and ranks match the agent dashboard logic
    return this.generateLeaderboardFromSales();
  }

  /**
   * Get all leaderboard entries with agent details
   * Uses the same sales-aggregation logic as the agent dashboard so totals/ranks are consistent.
   */
  async getLeaderboardEntriesWithDetails(): Promise<any[]> {
    // generate leaderboard from sales which already attaches agentName
    const generated = await this.generateLeaderboardFromSales();
    return generated;
  }

  /**
   * Generate leaderboard from sales data
   */
  async generateLeaderboardFromSales(): Promise<LeaderboardEntry[]> { // Method to create leaderboard entries from sales data.
    const sales = await this.get<Sale[]>('/sales'); // Fetches sales data.
    const agents = await this.get<any[]>('/users'); // Fetches agent data.

    // The agent dashboard sums ALL sales (not only Completed) and displays the agent's friendly name.
    // To match the dashboard exactly we should prefer the user record's `name` when available,
    // otherwise fall back to `sale.agentName` or the agentId.
    const salesByAgent: { [agentId: string]: { name: string; total: number } } = {};
    const usersById: Record<string, string> = {};
    for (const u of (agents || [])) {
      if (u && u.agentid) usersById[u.agentid] = u.name || u.agentid;
    }

    for (const sale of (sales || [])) {
      const agentId = sale.agentid || 'unknown';
      const saleAmount = Number(sale.saleamount || 0) || 0;
      const nameFromUser = usersById[agentId];
      const nameFromSale = (sale as any).agentName;
      const finalName = nameFromUser || nameFromSale || agentId;

      if (!salesByAgent[agentId]) {
        salesByAgent[agentId] = { name: finalName, total: 0 };
      }
      salesByAgent[agentId].total += saleAmount;
    }

    // Sort by totalSales descending
    // Convert to array and sort by total descending
    const sortedAgents = Object.entries(salesByAgent)
      .map(([agentId, v]) => ({ agentId, totalSales: v.total, name: v.name }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    // Generate entryIds and create entries
    const entries: LeaderboardEntry[] = []; // Array to hold final entries.
    for (let i = 0; i < sortedAgents.length; i++) { // Loops to create entries.
      const suffix = String(i + 1).padStart(3, '0'); // Generates padded suffix.
      const entryId = `LE-${suffix}`; // Creates entry ID.
      const agent = sortedAgents[i]; // Gets agent data.
      // Resolve final display name using usersById first (consistent with dashboard)
      const agentName = usersById[agent.agentId] || (agent as any).name || agent.agentId;

      entries.push({
        entryId,
        agentId: agent.agentId,
        rank: agent.rank,
        totalSales: agent.totalSales,
        agentName
      } as LeaderboardEntry);
    }

    return entries; // Returns the generated entries.
  }

  // Badge functionality removed — not used by leaderboard

  /**
   * Create a new leaderboard entry
   */
  async createLeaderboardEntry(payload: Omit<LeaderboardEntry, 'entryId'>): Promise<LeaderboardEntry> { // Method to create a new leaderboard entry.
    try {
      // Get existing entries and compute next entryId
      const entries = await this.get<LeaderboardEntry[]>('/leaderboard'); // Fetches existing entries.
      const existingIds = (entries || []).map(e => e.entryId || '').filter(id => id.startsWith('LE-')); // Filters existing IDs.
      let maxNum = 0; // Variable to track max number.
      for (const id of existingIds) { // Loops to find max number.
        const numPart = id.replace('LE-', ''); // Extracts number part.
        const num = parseInt(numPart, 10); // Parses to int.
        if (!isNaN(num) && num > maxNum) maxNum = num; // Updates max.
      }
      const next = maxNum + 1; // Calculates next number.
      const suffix = String(next).padStart(3, '0'); // Pads the suffix.
      const entryId = `LE-${suffix}`; // Creates new entry ID.

      const newEntry: LeaderboardEntry = { // Creates new entry object.
        entryId,
        agentId: payload.agentId,
        rank: payload.rank,
        totalSales: payload.totalSales
      };

      return await this.post<LeaderboardEntry>('/leaderboard', newEntry); // Posts the new entry.
    } catch (err) {
      console.error('createLeaderboardEntry error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }

  // Badge creation removed

  /**
   * Update an existing leaderboard entry
   */
  async updateLeaderboardEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> { // Method to update a leaderboard entry.
    try {
      const arr = await this.get<LeaderboardEntry[]>('/leaderboard', { entryId: entry.entryId }); // Fetches entry by ID.
      const existing = (arr || [])[0]; // Gets the first entry.
      if (!existing || (existing as any).id === undefined) { // Checks if exists.
        throw new Error(`Leaderboard entry not found for entryId ${entry.entryId}`); // Throws error if not found.
      }
      const id = (existing as any).id; // Gets internal ID.
      return await this.patch<LeaderboardEntry>(`/leaderboard/${id}`, entry); // Patches the entry.
    } catch (err) {
      console.error('updateLeaderboardEntry error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }

  // Badge update removed

  /**
   * Delete leaderboard entry by entryId
   */
  async deleteLeaderboardEntry(entryId: string): Promise<void> { // Method to delete a leaderboard entry.
    try {
      const arr = await this.get<LeaderboardEntry[]>('/leaderboard', { entryId }); // Fetches entry by ID.
      const existing = (arr || [])[0]; // Gets the first entry.
      if (!existing || (existing as any).id === undefined) { // Checks if exists.
        throw new Error(`Leaderboard entry not found for entryId ${entryId}`); // Throws error if not found.
      }
      const id = (existing as any).id; // Gets internal ID.
      await this.deleteReq<void>(`/leaderboard/${id}`); // Deletes the entry.
    } catch (err) {
      console.error('deleteLeaderboardEntry error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }

  // Badge deletion removed
}
