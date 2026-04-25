import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import type { CustomerDetail, AuditEntry } from '../../models/customer.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent implements OnInit {
  private svc = inject(CustomerService);
  private route = inject(ActivatedRoute);

  customer: CustomerDetail | null = null;
  auditLog: AuditEntry[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getCustomerDetail(id).subscribe({
      next: (res) => {
        this.customer = res.data.customer;
        this.auditLog = res.data.auditLog ?? [];
        this.loading = false;
      },
      error: (err: Error) => { this.error = err.message; this.loading = false; },
    });
  }
}
