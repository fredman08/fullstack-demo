import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Customer, AuditEntry, CustomerDetail, GraphQLResponse } from '../models/customer.model';

const API = 'http://localhost:4000/api';
const GRAPHQL = 'http://localhost:4000/graphql';

// Topic 9: Angular — Service acts like an IBM i *SRVPGM (shared, injectable business logic)
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  // ── REST calls (Topic 11) ──────────────────────────────────────────────────

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API}/customers`);
  }

  createCustomer(name: string, email: string): Observable<Customer> {
    return this.http.post<Customer>(`${API}/customers`, { name, email });
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/customers/${id}`);
  }

  // ── GraphQL call (Topic 12) ───────────────────────────────────────────────
  // One endpoint, client specifies exactly which fields it needs

  getCustomerDetail(id: number): Observable<GraphQLResponse<{
    customer: CustomerDetail;
    auditLog: AuditEntry[];
  }>> {
    const query = `
      query GetCustomer($id: ID!) {
        customer(id: $id) {
          id name email created_at
          orders { id product total status created_at }
        }
        auditLog(customerId: $id) {
          action timestamp
        }
      }
    `;
    return this.http.post<GraphQLResponse<{ customer: CustomerDetail; auditLog: AuditEntry[] }>>(
      GRAPHQL,
      { query, variables: { id: String(id) } },
    );
  }
}
