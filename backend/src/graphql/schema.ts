// Topic 12: GraphQL — strongly typed schema (like a contract between client and server)
export const typeDefs = `#graphql
  type Customer {
    id: ID!
    name: String!
    email: String!
    created_at: String!
    orders: [Order!]!
  }

  type Order {
    id: ID!
    product: String!
    total: Float!
    status: String!
    created_at: String!
  }

  type AuditEntry {
    action: String!
    timestamp: String!
  }

  type Query {
    customers: [Customer!]!
    customer(id: ID!): Customer
    auditLog(customerId: ID!): [AuditEntry!]!
  }

  type Mutation {
    createCustomer(name: String!, email: String!): Customer!
    deleteCustomer(id: ID!): Boolean!
  }
`;
