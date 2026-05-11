import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { CustomerFormComponent } from './customer-form.component';
import { CustomerService } from '../../services/customer.service';

class MockCustomerService {
  createCustomer = jasmine.createSpy('createCustomer');
}

describe('CustomerFormComponent', () => {
  let fixture: ComponentFixture<CustomerFormComponent>;
  let component: CustomerFormComponent;
  let svc: MockCustomerService;
  let router: Router;

  beforeEach(async () => {
    svc = new MockCustomerService();
    await TestBed.configureTestingModule({
      imports: [CustomerFormComponent],
      providers: [
        { provide: CustomerService, useValue: svc },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('shows validation error when fields are empty', () => {
    component.name = '';
    component.email = '';

    component.submit();

    expect(component.error).toContain('required');
    expect(svc.createCustomer).not.toHaveBeenCalled();
  });

  it('calls service and navigates on successful submit', () => {
    spyOn(router, 'navigate');
    svc.createCustomer.and.returnValue(
      of({ id: 1, name: 'A', email: 'a@b.co', created_at: 'now' }),
    );
    component.name = 'A';
    component.email = 'a@b.co';

    component.submit();

    expect(svc.createCustomer).toHaveBeenCalledWith('A', 'a@b.co');
    expect(router.navigate).toHaveBeenCalledWith(['/customers']);
  });

  it('shows backend error on failure', () => {
    svc.createCustomer.and.returnValue(
      throwError(() => ({ error: { error: 'email is invalid' } })),
    );
    component.name = 'A';
    component.email = 'bad';

    component.submit();

    expect(component.error).toBe('email is invalid');
    expect(component.loading).toBeFalse();
  });
});
