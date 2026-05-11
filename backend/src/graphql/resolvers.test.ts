jest.mock('../services/customerService', () => ({
  getAllCustomers: jest.fn(),
  getCustomerById: jest.fn(),
  getOrdersByCustomerId: jest.fn(),
  createCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
}));

jest.mock('../services/auditService', () => ({
  logAudit: jest.fn(),
  getAuditLog: jest.fn(),
}));

import { resolvers } from './resolvers';
import * as customerService from '../services/customerService';
import * as auditService from '../services/auditService';

const mockedCustomers = customerService as jest.Mocked<typeof customerService>;
const mockedAudit = auditService as jest.Mocked<typeof auditService>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GraphQL resolvers', () => {
  it('Query.customers delegates to customerService.getAllCustomers', async () => {
    mockedCustomers.getAllCustomers.mockResolvedValue([
      { id: 1, name: 'A', email: 'a@b.co', created_at: 'now' },
    ] as never);

    const result = await resolvers.Query.customers();
    expect(mockedCustomers.getAllCustomers).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(1);
  });

  it('Query.customer coerces the ID to a number', async () => {
    mockedCustomers.getCustomerById.mockResolvedValue(null);
    await resolvers.Query.customer(undefined, { id: '42' });
    expect(mockedCustomers.getCustomerById).toHaveBeenCalledWith(42);
  });

  it('Query.auditLog coerces the customerId to a number', async () => {
    mockedAudit.getAuditLog.mockResolvedValue([]);
    await resolvers.Query.auditLog(undefined, { customerId: '7' });
    expect(mockedAudit.getAuditLog).toHaveBeenCalledWith(7);
  });

  it('Mutation.createCustomer returns the customer and fires logAudit', async () => {
    mockedCustomers.createCustomer.mockResolvedValue({
      id: 1,
      name: 'X',
      email: 'x@y.co',
      created_at: 'now',
    } as never);
    mockedAudit.logAudit.mockResolvedValue(undefined);

    const out = await resolvers.Mutation.createCustomer(undefined, {
      name: 'X',
      email: 'x@y.co',
    });
    expect(out.id).toBe(1);

    await new Promise((r) => setImmediate(r));
    expect(mockedAudit.logAudit).toHaveBeenCalledWith(1, 'CREATE_VIA_GRAPHQL', {
      name: 'X',
      email: 'x@y.co',
    });
  });

  it('Customer.orders delegates to getOrdersByCustomerId(parent.id)', () => {
    mockedCustomers.getOrdersByCustomerId.mockResolvedValue([] as never);
    resolvers.Customer.orders({ id: 9 });
    expect(mockedCustomers.getOrdersByCustomerId).toHaveBeenCalledWith(9);
  });

  it('Mutation.deleteCustomer coerces the ID to a number', async () => {
    mockedCustomers.deleteCustomer.mockResolvedValue(true);
    await resolvers.Mutation.deleteCustomer(undefined, { id: '3' });
    expect(mockedCustomers.deleteCustomer).toHaveBeenCalledWith(3);
  });
});
