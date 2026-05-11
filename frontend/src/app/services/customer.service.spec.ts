import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { environment } from '../../environments/environment';

describe('CustomerService', () => {
  let svc: CustomerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomerService],
    });
    svc = TestBed.inject(CustomerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getCustomers GETs the customers REST endpoint', () => {
    svc.getCustomers().subscribe((data) => {
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Alice');
    });

    const req = httpMock.expectOne(`${environment.apiBase}/customers`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Alice', email: 'a@b.co', created_at: 'now' }]);
  });

  it('createCustomer POSTs the body to the REST endpoint', () => {
    svc.createCustomer('Bob', 'b@b.co').subscribe((c) => {
      expect(c.id).toBe(2);
    });

    const req = httpMock.expectOne(`${environment.apiBase}/customers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Bob', email: 'b@b.co' });
    req.flush({ id: 2, name: 'Bob', email: 'b@b.co', created_at: 'now' });
  });

  it('deleteCustomer DELETEs the REST endpoint by id', () => {
    svc.deleteCustomer(5).subscribe();

    const req = httpMock.expectOne(`${environment.apiBase}/customers/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getCustomerDetail POSTs the GraphQL query with variables', () => {
    svc.getCustomerDetail(3).subscribe();

    const req = httpMock.expectOne(environment.graphqlUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.query).toContain('query GetCustomer');
    expect(req.request.body.variables).toEqual({ id: '3' });
    req.flush({
      data: { customer: { id: 3, name: 'C', email: 'c@c.co', created_at: 'now', orders: [] }, auditLog: [] },
    });
  });
});
