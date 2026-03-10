import { Injectable, Optional } from '@angular/core'; // Imports Injectable and Optional decorators from Angular core for dependency injection.
import { Agent } from '../models/agent.model'; // Imports the Agent model for type definitions.
import { firstValueFrom } from 'rxjs'; // Imports firstValueFrom to convert observables to promises.
import { HttpClient, HttpParams } from '@angular/common/http'; // Imports HttpClient and HttpParams for HTTP requests.

@Injectable({ // Decorator to make the class injectable as a service.
  providedIn: 'root' // Provides the service at the root level.
})
export class AgentService { // Main service class for agent operations.
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
   * Get all agents
   */
  async getAgents(): Promise<Agent[]> {
    const agents = await this.get<any[]>('/users');
    // Normalize: map 'id' to 'agentid' if needed, and filter out admin roles
    return ((agents || [])
      .filter(agent => agent.role !== 'admin') // Exclude admin roles
      .map(agent => ({
        ...agent,
        agentid: agent.agentid || agent.id?.toString()
      }))
      .sort((a, b) => a.agentid.localeCompare(b.agentid))) as Agent[]; // Sort by agentid in ascending order
  }

  /**
   * Check if an agent with the given agentid already exists
   */
  async agentIdExists(agentid: string): Promise<boolean> {
    try {
      const agents = await this.get<Agent[]>('/users', { agentid });
      return (agents || []).length > 0;
    } catch (err) {
      console.error('Error checking agent ID', err);
      return false;
    }
  }

  /**
   * Create a new agent
   */
  async createAgent(agent: Omit<Agent, 'agentid'>, customAgentId?: string): Promise<Agent> {
    try {
      // Check if customAgentId already exists
      if (customAgentId) {
        const exists = await this.agentIdExists(customAgentId);
        if (exists) {
          throw new Error(`Agent ID "${customAgentId}" is already in use. Please choose a different ID.`);
        }
      }

      // Include customAgentId in the payload if provided
      const payload = customAgentId ? { ...agent, agentid: customAgentId } : agent;
      const response = await this.post<any>('/users', payload);
      console.log('Backend response:', response);
      
      // Use custom agentid if provided, otherwise use backend's id/agentid
      const agentid = customAgentId || response.agentid || response.id?.toString();
      
      if (!agentid) {
        throw new Error('No agent ID available');
      }
      
      console.log('Assigned agentid:', agentid);
      
      const result = {
        ...response,
        agentid
      } as Agent;
      
      console.log('Final agent object:', result);
      return result;
    } catch (err) {
      console.error('createAgent error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }

  /**
   * Update an existing agent (looks up by agentid then PATCH)
   */
  async updateAgent(agent: Agent): Promise<Agent> { // Method to update an existing agent.
    try {
      const agents = await this.get<Agent[]>('/users', { agentid: agent.agentid }); // Fetches agent by ID.
      const existing = (agents || [])[0]; // Gets the existing agent.
      if (!existing || (existing as any).id === undefined) { // Checks if agent exists.
        throw new Error(`Agent not found for agentid ${agent.agentid}`); // Throws error if not found.
      }
      const id = (existing as any).id; // Extracts internal ID.
      return await this.patch<Agent>(`/users/${id}`, agent); // Updates agent data.
    } catch (err) {
      console.error('updateAgent error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }

  /**
   * Delete agent by agentid (finds underlying numeric id then DELETE)
   */
  async deleteAgent(agentid: string): Promise<void> { // Method to delete an agent by ID.
    try {
      const agents = await this.get<Agent[]>('/users', { agentid }); // Fetches agent by ID.
      const existing = (agents || [])[0]; // Gets the existing agent.
      if (!existing || (existing as any).id === undefined) { // Checks if agent exists.
        throw new Error(`Agent not found for agentid ${agentid}`); // Throws error if not found.
      }
      const id = (existing as any).id; // Extracts internal ID.
      await this.deleteReq<void>(`/users/${id}`); // Deletes the agent.
    } catch (err) {
      console.error('deleteAgent error', err); // Logs error.
      throw err; // Re-throws error.
    }
  }
}

