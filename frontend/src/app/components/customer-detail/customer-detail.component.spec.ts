import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { CustomerDetailComponent } from './customer-detail.component';
import { CustomerService } from '../../services/customer.service';

class MockCustomerService {
  getCustomerDetail = jasmine.createSpy('getCustomerDetail');
}

function makeRoute(id: string): Partial<ActivatedRoute> {
  return {
    snapshot: {
      paramMap: { get: (k: string) => (k === 'id' ? id : null) },
    } as never,
  };
}

describe('CustomerDetailComponent', () => {
  let fixture: ComponentFixture<CustomerDetailComponent>;
  let component: CustomerDetailComponent;
  let svc: MockCustomerService;

  async function setup(id: string) {
    svc = new MockCustomerService();
    await TestBed.configureTestingModule({
      imports: [CustomerDetailComponent],
      providers: [
        { provide: CustomerService, useValue: svc },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: makeRoute(id) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDetailComponent);
    component = fixture.componentInstance;
  }

  it('loads customer with orders and audit on init', async () => {
    await setup('5');
    svc.getCustomerDetail.and.returnValue(
      of({
        data: {
          customer: {
            id: 5,
            name: 'Eve',
            email: 'eve@x.co',
            created_at: '2024-01-01T00:00:00.000Z',
            orders: [
              { id: 1, product: 'Laptop', total: 1, status: 'paid', created_at: '2024-01-01T00:00:00.000Z' },
            ],
          },
          auditLog: [{ action: 'CREATE', timestamp: '2024-01-01T00:00:00.000Z' }],
        },
      }),
    );

    fixture.detectChanges();

    expect(svc.getCustomerDetail).toHaveBeenCalledWith(5);
    expect(component.customer?.name).toBe('Eve');
    expect(component.auditLog.length).toBe(1);

    const orderRows = fixture.nativeElement.querySelectorAll('[data-testid="order-row"]');
    expect(orderRows.length).toBe(1);
    const auditRows = fixture.nativeElement.querySelectorAll('[data-testid="audit-entry"]');
    expect(auditRows.length).toBe(1);
  });

  it('renders empty states when no orders or audit', async () => {
    await setup('6');
    svc.getCustomerDetail.and.returnValue(
      of({
        data: {
          customer: { id: 6, name: 'F', email: 'f@x.co', created_at: '2024-01-01T00:00:00.000Z', orders: [] },
          auditLog: [],
        },
      }),
    );

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="no-orders"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="no-audit"]')).toBeTruthy();
  });

  it('sets error message on service failure', async () => {
    await setup('7');
    svc.getCustomerDetail.and.returnValue(throwError(() => new Error('nope')));

    fixture.detectChanges();

    expect(component.error).toBe('nope');
    expect(component.loading).toBeFalse();
  });
});
