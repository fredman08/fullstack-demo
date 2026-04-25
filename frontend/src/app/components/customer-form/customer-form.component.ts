import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './customer-form.component.html',
})
export class CustomerFormComponent {
  private svc = inject(CustomerService);
  private router = inject(Router);

  name = '';
  email = '';
  loading = false;
  error = '';

  submit(): void {
    if (!this.name || !this.email) {
      this.error = 'Both fields are required.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.svc.createCustomer(this.name, this.email).subscribe({
      next: () => this.router.navigate(['/customers']),
      error: (err: { error?: { error?: string }; message?: string }) => {
        this.error = err.error?.error ?? err.message ?? 'Failed to create customer.';
        this.loading = false;
      },
    });
  }
}
