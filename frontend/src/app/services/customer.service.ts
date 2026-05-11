import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Customer, AuditEntry, CustomerDetail, GraphQLResponse } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${environment.apiBase}/customers`);
  }

  createCustomer(name: string, email: string): Observable<Customer> {
    return this.http.post<Customer>(`${environment.apiBase}/customers`, { name, email });
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBase}/customers/${id}`);
  }

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
      environment.graphqlUrl,
      { query, variables: { id: String(id) } },
    );
  }
}
