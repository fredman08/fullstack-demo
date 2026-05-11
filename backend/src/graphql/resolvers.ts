import * as customerService from '../services/customerService';
import { logAudit, getAuditLog } from '../services/auditService';

// GraphQL resolvers — each field maps to a function (like RPG sub-procedures)
export const resolvers = {
  Query: {
    customers: () => customerService.getAllCustomers(),

    customer: (_: unknown, { id }: { id: string }) =>
      customerService.getCustomerById(Number(id)),

    auditLog: (_: unknown, { customerId }: { customerId: string }) =>
      getAuditLog(Number(customerId)),
  },

  // Nested resolver — automatically called when 'orders' is requested on a Customer
  Customer: {
    orders: (parent: { id: number }) => customerService.getOrdersByCustomerId(parent.id),
  },

  Mutation: {
    createCustomer: async (_: unknown, args: { name: string; email: string }) => {
      const customer = await customerService.createCustomer(args);
      logAudit(customer.id, 'CREATE_VIA_GRAPHQL', args).catch((e) =>
        console.error('Audit log failed:', e),
      );
      return customer;
    },

    deleteCustomer: (_: unknown, { id }: { id: string }) =>
      customerService.deleteCustomer(Number(id)),
  },
};
