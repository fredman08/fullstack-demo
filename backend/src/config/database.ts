import { Pool } from 'pg';
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Topic 13: PostgreSQL — connection pool (like EXEC SQL in RPG)
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  database: process.env.POSTGRES_DB ?? 'fullstack_demo',
  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
});

// Topic 14: DynamoDB — AWS SDK v3 client
const dynamoRaw = new DynamoDBClient({
  region: process.env.AWS_REGION ?? 'ap-southeast-1',
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'local',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'local',
  },
});

export const dynamoDoc = DynamoDBDocumentClient.from(dynamoRaw);

// Seed schema and sample data in PostgreSQL
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

// Create DynamoDB table for audit logs (idempotent)
export async function initDynamoDB(): Promise<void> {
  const tableName = process.env.AUDIT_TABLE ?? 'customer_audit';
  try {
    await dynamoRaw.send(
      new CreateTableCommand({
        TableName: tableName,
        KeySchema: [
          { AttributeName: 'pk', KeyType: 'HASH' },
          { AttributeName: 'sk', KeyType: 'RANGE' },
        ],
        AttributeDefinitions: [
          { AttributeName: 'pk', AttributeType: 'S' },
          { AttributeName: 'sk', AttributeType: 'S' },
        ],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    console.log(`DynamoDB table '${tableName}' created`);
  } catch (err: unknown) {
    const name = (err as { name?: string }).name;
    if (name !== 'ResourceInUseException') {
      console.warn('DynamoDB init skipped:', (err as Error).message);
    } else {
      console.log('DynamoDB ready');
    }
  }
}
