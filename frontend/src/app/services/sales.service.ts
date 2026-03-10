import { Injectable, Optional } from '@angular/core';
import { Sale } from '../models/sale.model';
import { Agent } from '../models/agent.model';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  
private apiUrl = 'http://localhost:3000';
  constructor(@Optional() private http?: HttpClient) {}

  private qsParams(paramsObj?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!paramsObj) return undefined;
    return new HttpParams({ fromObject: Object.entries(paramsObj).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {}) });
  }

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
   * Get all sales with agent and policy details
   */
  async getAllSalesWithDetails(): Promise<any[]> {
    const sales = await this.get<Sale[]>('/sales');
    const agents = await this.get<Agent[]>('/users');
    const policies = await this.get<{ policyid: string; name: string }[]>('/policies');

    return (sales || []).map((sale) => ({
      ...sale,
      agentName: agents.find((a) => a.agentid === sale.agentid)?.name || sale.agentid,
      policyName: policies.find((p) => p.policyid === sale.policyid)?.name || sale.policyid
    }));
  }

  /**
   * Get total sales amount
   */
  async getTotalSalesAmount(): Promise<number> {
    const sales = await this.get<Sale[]>('/sales');
    return (sales || []).reduce((sum, s) => sum + (s.saleamount || 0), 0);
  }

  /**
   * Get conversion rate (dummy calculation)
   */
  async getConversionRate(): Promise<number> {
    // Placeholder: replace with real logic later
    return 12.5;
  }

  /**
   * Get policies
   */
  async getPolicies(): Promise<{ policyid: string; name: string }[]> {
    return this.get<{ policyid: string; name: string }[]>('/policies');
  }

  /**
   * Get agents
   */
  async getAgents(): Promise<Agent[]> {
    return this.get<Agent[]>('/users');
  }

  /**
   * Get sales
   */
  async getSales(): Promise<Sale[]> {
    return this.get<Sale[]>('/sales');
  }

  /**
   * Get sales by agent ID
   */
  async getSalesByAgentId(agentid: string): Promise<Sale[]> {
    return this.get<Sale[]>('/sales', { agentid });
  }

  /**
   * Create a new sale (auto-generates saleid by policy type and persists via POST)
   */
  async createSale(payload: Omit<Sale, 'saleid'>): Promise<Sale> {
    try {
      // Resolve policy name to determine prefix
      const policies = await this.get<{ policyid: string; name: string }[]>('/policies');
      const policy = policies.find(p => p.policyid === payload.policyid);
      const pname = policy?.name || '';
      let prefix = 'X';

      const p = pname.toLowerCase();
      if (p.includes('life')) prefix = 'L';
      else if (p.includes('auto') || p.includes('vehicle') || p.includes('car')) prefix = 'V';
      else if (p.includes('health')) prefix = 'H';
      else if (p.includes('home')) prefix = 'HO';
      else prefix = (pname.charAt(0) || 'X').toUpperCase();

      // Get existing sales and compute next number for same prefix
      const sales = await this.get<Sale[]>('/sales');
      const existingForPrefix = (sales || []).filter(s => (s.saleid || '').startsWith(prefix));

      let maxNum = 0;
      for (const s of existingForPrefix) {
        const sid = s.saleid || '';
        const numPart = sid.replace(prefix, '').replace(/^[-_]/,'')
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }

      const next = maxNum + 1;
      const suffix = String(next).padStart(3, '0');
      const saleid = `${prefix}${suffix}`;

      const newSale: Sale = {
        saleid,
        policyid: payload.policyid,
        agentid: payload.agentid,
        saleamount: payload.saleamount,
        saletype: payload.saletype,
        saledate: payload.saledate,
        status: payload.status || 'Pending'
      };

      return await this.post<Sale>('/sales', newSale);
    } catch (err) {
      console.error('createSale error', err);
      throw err;
    }
  }

  /**
   * Update an existing sale (looks up by saleid then PATCH)
   */
  async updateSale(sale: Sale): Promise<Sale> {
    try {
      const arr = await this.get<Sale[]>('/sales', { saleid: sale.saleid });
      const existing = (arr || [])[0];
      if (!existing || (existing as any).id === undefined) {
        throw new Error(`Sale not found for saleid ${sale.saleid}`);
      }
      const id = (existing as any).id;
      return await this.patch<Sale>(`/sales/${id}`, sale);
    } catch (err) {
      console.error('updateSale error', err);
      throw err;
    }
  }

  /**
   * Delete sale by saleid (finds underlying numeric id then DELETE)
   */
  async deleteSale(saleid: string): Promise<void> {
    try {
      const arr = await this.get<Sale[]>('/sales', { saleid });
      const existing = (arr || [])[0];
      if (!existing || (existing as any).id === undefined) {
        throw new Error(`Sale not found for saleid ${saleid}`);
      }
      const id = (existing as any).id;
      await this.deleteReq<void>(`/sales/${id}`);
    } catch (err) {
      console.error('deleteSale error', err);
      throw err;
    }
  }

  /**
   * Create sale wrapper for agent-specific behavior if needed
   */
  async addSaleForAgent(agentid: string, data: Omit<Sale, 'saleid' | 'agentid'>): Promise<Sale> {
    return this.createSale({ ...data, agentid });
  }
}
