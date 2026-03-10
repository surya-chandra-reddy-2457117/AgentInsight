import { Injectable, signal, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Agent } from '../models/agent.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private doc = inject(DOCUMENT);

  isAuthenticated = signal(false);
  currentUser = signal<Agent | null>(null);

  private apiUrl = 'http://localhost:3000';
  private tokenKey = 'auth_token';

  private httpClient: HttpClient | null = (() => {
    try {
      return inject(HttpClient) as HttpClient;
    } catch {
      return null;
    }
  })();

  constructor() {
    this.checkAuth();
  }

  // ✅ LocalStorage check
  private isLocalStorageAvailable(): boolean {
    return typeof this.doc !== 'undefined' && !!this.doc.defaultView?.localStorage;
  }

  // ✅ Build query string
  private buildQueryString(paramsObj?: Record<string, string | number | boolean>): string {
    if (!paramsObj) return '';
    const entries = Object.entries(paramsObj).map(([k, v]) => [k, String(v)]);
    return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  }

  // ✅ Fetch user by email
  private async fetchUsersByEmail(email: string): Promise<Agent | undefined> {
    if (this.httpClient) {
      const arr = await firstValueFrom(
        this.httpClient.get<Agent[]>(`${this.apiUrl}/users`, { params: { email } })
      );
      return arr[0];
    }

    const qs = this.buildQueryString({ email });
    const res = await fetch(`${this.apiUrl}/users${qs}`);
    if (!res.ok) return undefined;
    const arr = await res.json();
    return arr[0];
  }

  // ✅ Fetch all users
  private async fetchAllUsers(): Promise<Agent[]> {
    if (this.httpClient) {
      return await firstValueFrom(
        this.httpClient.get<Agent[]>(`${this.apiUrl}/users`)
      );
    } else {
      const res = await fetch(`${this.apiUrl}/users`);
      return await res.json();
    }
  }

  // ✅ Generate next agent ID (A-###)
  private async generateNextAgentId(): Promise<string> {
    const users: Agent[] = await this.fetchAllUsers();

    const numbers = users
      .map(u => u.agentid)
      .filter(id => /^A-\d+$/.test(id))
      .map(id => parseInt(id.split('-')[1], 10));

    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    const next = max + 1;

    return `A-${next.toString().padStart(3, '0')}`;
  }

  // ✅ REGISTER
  async register(data: { fullName: string; email: string; password: string }): Promise<boolean> {
    try {
      const existing = await this.fetchUsersByEmail(data.email);
      if (existing) return false;

      const nextId = await this.generateNextAgentId();

      const newUser: Agent = {
        agentid: nextId,
        name: data.fullName,
        email: data.email,
        phone: '',
        role: 'agent',
        password: data.password as any
      };

      let created: Agent;

      if (this.httpClient) {
        created = await firstValueFrom(
          this.httpClient.post<Agent>(`${this.apiUrl}/users`, newUser)
        );
      } else {
        const res = await fetch(`${this.apiUrl}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        created = await res.json();
      }

      // ✅ Auto-login
      const token = btoa(`${created.email}:${Date.now()}`);
      this.setToken(token);
      localStorage.setItem(this.tokenKey, token);

      this.currentUser.set(created);
      this.isAuthenticated.set(true);

      if (this.isLocalStorageAvailable()) {
        const userData: Agent = {
          agentid: created.agentid,
          name: created.name,
          email: created.email,
          phone: created.phone,
          role: created.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  }

  // ✅ LOGIN
  async login(email: string, password: string): Promise<boolean> {
    const user = await this.fetchUsersByEmail(email);

    if (user && (user as any).password === password) {
      const token = btoa(`${user.email}:${Date.now()}`);
      this.setToken(token);
      localStorage.setItem(this.tokenKey, token);

      this.isAuthenticated.set(true);
      this.currentUser.set(user);

      if (this.isLocalStorageAvailable()) {
        const userData: Agent = {
          agentid: user.agentid,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      return true;
    }
    return false;
  }

  // ✅ Token helpers
  getToken(): string | null {
    try {
      if (this.isLocalStorageAvailable()) {
        return localStorage.getItem(this.tokenKey);
      }
    } catch {}
    return null;
  }

  setToken(token: string | null): void {
    try {
      if (this.isLocalStorageAvailable()) {
        if (token) localStorage.setItem(this.tokenKey, token);
        else localStorage.removeItem(this.tokenKey);
      }
    } catch {}
  }

  // ✅ LOGOUT
  logout(): void {
    this.setToken(null);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);

    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('user');
    }
  }

  // ✅ Restore auth state on app load
  checkAuth(): boolean {
    try {
      const token = this.getToken();
      const userJson = this.isLocalStorageAvailable() ? localStorage.getItem('user') : null;

      if (token && userJson) {
        const user = JSON.parse(userJson) as Agent;
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        return true;
      }

      this.isAuthenticated.set(false);
      this.currentUser.set(null);
      return false;

    } catch (e) {
      console.warn('checkAuth failed', e);
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
      return false;
    }
  }

  // ✅ Update user
  async updateUser(agent: Agent): Promise<Agent> {
    try {
      let existing: any;

      if (this.httpClient) {
        const arr = await firstValueFrom(
          this.httpClient.get<any[]>(`${this.apiUrl}/users`, { params: { agentid: agent.agentid } })
        );
        existing = arr[0];
      } else {
        const qs = this.buildQueryString({ agentid: agent.agentid });
        const res = await fetch(`${this.apiUrl}/users${qs}`);
        existing = (await res.json())[0];
      }

      if (existing && existing.id !== undefined) {
        if (this.httpClient) {
          const updated = await firstValueFrom(
            this.httpClient.patch<Agent>(`${this.apiUrl}/users/${existing.id}`, agent)
          );
          this.setCurrentUser(updated);
          return updated;
        } else {
          const res = await fetch(`${this.apiUrl}/users/${existing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agent)
          });
          const updated = await res.json();
          this.setCurrentUser(updated);
          return updated;
        }
      } else {
        if (this.httpClient) {
          const created = await firstValueFrom(
            this.httpClient.post<Agent>(`${this.apiUrl}/users`, agent)
          );
          this.setCurrentUser(created);
          return created;
        } else {
          const res = await fetch(`${this.apiUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agent)
          });
          const created = await res.json();
          this.setCurrentUser(created);
          return created;
        }
      }
    } catch (e) {
      console.error('updateUser error', e);
      throw e;
    }
  }

  // ✅ Set current user
  setCurrentUser(agent: Agent | null): void {
    this.currentUser.set(agent);
    this.isAuthenticated.set(!!agent);

    if (agent && this.isLocalStorageAvailable()) {
      const userData: Agent = {
        agentid: agent.agentid,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        role: agent.role
      };
      localStorage.setItem('user', JSON.stringify(userData));
    } else if (!agent && this.isLocalStorageAvailable()) {
      localStorage.removeItem('user');
    }
  }
}
