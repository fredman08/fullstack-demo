process.env.NODE_ENV = 'test';
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ?? 'http://localhost';

// Default to a local Postgres test database (override via CI / .env.test).
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST ?? 'localhost';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT ?? '5432';
process.env.POSTGRES_DB = process.env.POSTGRES_DB ?? 'fullstack_demo_test';
process.env.POSTGRES_USER = process.env.POSTGRES_USER ?? 'postgres';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? 'postgres';
