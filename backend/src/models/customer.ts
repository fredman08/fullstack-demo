// Topic 7: TypeScript — interfaces act like RPG Data Structures (DS)

export interface Customer {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Order {
  id: number;
  customer_id: number;
  product: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
}
