// Topic 7: TypeScript — shared interfaces (equivalent to RPG Data Structures)

export interface Customer {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Order {
  id: number;
  product: string;
  total: number;
  status: string;
  created_at: string;
}

export interface AuditEntry {
  action: string;
  timestamp: string;
}

export interface CustomerDetail extends Customer {
  orders: Order[];
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}
