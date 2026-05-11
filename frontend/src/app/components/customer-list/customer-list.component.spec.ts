import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CustomerListComponent } from './customer-list.component';
import { CustomerService } from '../../services/customer.service';

class MockCustomerService {
  getCustomers = jasmine.createSpy('getCustomers');
  deleteCustomer = jasmine.createSpy('deleteCustomer');
}

describe('CustomerListComponent', () => {
  let fixture: ComponentFixture<CustomerListComponent>;
  let component: CustomerListComponent;
  let svc: MockCustomerService;

  beforeEach(async () => {
    svc = new MockCustomerService();
    await TestBed.configureTestingModule({
      imports: [CustomerListComponent],
      providers: [
        { provide: CustomerService, useValue: svc },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerListComponent);
    component = fixture.componentInstance;
  });

  it('loads customers on init and renders rows', () => {
    svc.getCustomers.and.returnValue(
      of([{ id: 1, name: 'Alice', email: 'a@b.co', created_at: '2024-01-01T00:00:00.000Z' }]),
    );

    fixture.detectChanges();

    expect(svc.getCustomers).toHaveBeenCalled();
    expect(component.customers.length).toBe(1);
    expect(component.loading).toBeFalse();

    const rows = fixture.nativeElement.querySelectorAll('[data-testid="customer-row"]');
    expect(rows.length).toBe(1);
  });

  it('sets error message when load fails', () => {
    svc.getCustomers.and.returnValue(throwError(() => new Error('boom')));

    fixture.detectChanges();

    expect(component.error).toBe('boom');
    expect(component.loading).toBeFalse();
  });

  it('renders empty state when no customers', () => {
    svc.getCustomers.and.returnValue(of([]));

    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('[data-testid="empty-state"]');
    expect(empty).toBeTruthy();
  });

  it('delete() asks for confirm and calls service on yes', () => {
    svc.getCustomers.and.returnValue(of([{ id: 7, name: 'X', email: 'x@x.co', created_at: '2024-01-01T00:00:00.000Z' }]));
    svc.deleteCustomer.and.returnValue(of(undefined));

    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);

    component.delete(7);

    expect(svc.deleteCustomer).toHaveBeenCalledWith(7);
  });

  it('delete() does not call service when user cancels', () => {
    svc.getCustomers.and.returnValue(of([]));
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(false);

    component.delete(7);

    expect(svc.deleteCustomer).not.toHaveBeenCalled();
  });
});
