import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../index';
import { initDatabase, pgPool } from '../config/database';

let app: Express;

beforeAll(async () => {
  await initDatabase();
  app = await createApp();
});

beforeEach(async () => {
  await pgPool.query(
    'TRUNCATE TABLE audit_log, orders, customers RESTART IDENTITY CASCADE',
  );
});

afterAll(async () => {
  await pgPool.end();
});

describe('REST /api/customers', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/customers returns an empty array initially', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /api/customers creates a customer and writes an audit row', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({ name: 'Alice', email: 'alice@example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
    expect(typeof res.body.id).toBe('number');

    // give the fire-and-forget audit insert a chance to complete
    await new Promise((r) => setTimeout(r, 100));
    const audit = await pgPool.query(
      'SELECT action FROM audit_log WHERE customer_id = $1',
      [res.body.id],
    );
    expect(audit.rows[0]?.action).toBe('CREATE');
  });

  it('POST /api/customers with empty name returns 400', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({ name: '   ', email: 'a@b.co' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it('POST /api/customers with invalid email returns 400', async () => {
    const res = await request(app)
      .post('/api/customers')
      .send({ name: 'Bob', email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('DELETE /api/customers/:id removes a customer; repeat returns 404', async () => {
    const created = await request(app)
      .post('/api/customers')
      .send({ name: 'Carol', email: 'carol@example.com' });
    const id = created.body.id;

    const del1 = await request(app).delete(`/api/customers/${id}`);
    expect(del1.status).toBe(204);

    const del2 = await request(app).delete(`/api/customers/${id}`);
    expect(del2.status).toBe(404);
  });
});
