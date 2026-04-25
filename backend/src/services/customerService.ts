import { pgPool } from '../config/database';
import type { Customer, CreateCustomerDto, Order } from '../models/customer';

// Architecture principle: business logic lives in services, not routes

export async function getAllCustomers(): Promise<Customer[]> {
  const result = await pgPool.query<Customer>('SELECT * FROM customers ORDER BY created_at DESC');
  return result.rows;
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const result = await pgPool.query<Customer>('SELECT * FROM customers WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function getOrdersByCustomerId(customerId: number): Promise<Order[]> {
  const result = await pgPool.query<Order>(
    'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
    [customerId],
  );
  return result.rows;
}

export async function createCustomer(dto: CreateCustomerDto): Promise<Customer> {
  const result = await pgPool.query<Customer>(
    'INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING *',
    [dto.name, dto.email],
  );
  return result.rows[0];
}

export async function deleteCustomer(id: number): Promise<boolean> {
  const result = await pgPool.query('DELETE FROM customers WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
