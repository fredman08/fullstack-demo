import { Pool, type PoolConfig } from 'pg';

function buildPoolConfig(): PoolConfig {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }
  return {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    database: process.env.POSTGRES_DB ?? 'fullstack_demo',
    user: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  };
}

export const pgPool = new Pool(buildPoolConfig());

export async function initDatabase(): Promise<void> {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(100) NOT NULL,
      email      VARCHAR(150) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id          SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
      product     VARCHAR(100) NOT NULL,
      total       NUMERIC(10,2) NOT NULL,
      status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ  DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id          SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      action      TEXT NOT NULL,
      payload     JSONB,
      timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS audit_log_customer_ts_idx
      ON audit_log (customer_id, timestamp DESC);

    INSERT INTO customers (name, email) VALUES
      ('Juan dela Cruz', 'juan@example.com'),
      ('Maria Santos',   'maria@example.com')
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO orders (customer_id, product, total, status)
    SELECT c.id, 'Laptop', 1299.99, 'shipped'
    FROM   customers c WHERE c.email = 'juan@example.com'
    AND NOT EXISTS (SELECT 1 FROM orders WHERE customer_id = c.id);
  `);
  console.log('PostgreSQL ready');
}
