import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import type { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  private svc = inject(CustomerService);

  customers: Customer[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.svc.getCustomers().subscribe({
      next: (data) => { this.customers = data; this.loading = false; },
      error: (err: Error) => { this.error = err.message; this.loading = false; },
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this customer?')) return;
    this.svc.deleteCustomer(id).subscribe({ next: () => this.load() });
  }
}
