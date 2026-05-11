import 'dotenv/config';
import 'express-async-errors';
import express, { type Request, type Response, type NextFunction, type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import customerRoutes from './routes/customers';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { initDatabase } from './config/database';

function validateEnv(): void {
  const missing: string[] = [];

  const hasDbUrl = !!process.env.DATABASE_URL;
  const hasDiscretePg =
    !!process.env.POSTGRES_HOST &&
    !!process.env.POSTGRES_DB &&
    !!process.env.POSTGRES_USER;

  if (!hasDbUrl && !hasDiscretePg) {
    missing.push('DATABASE_URL (or POSTGRES_HOST/POSTGRES_DB/POSTGRES_USER)');
  }

  if (process.env.NODE_ENV === 'production' && !process.env.ALLOWED_ORIGINS) {
    missing.push('ALLOWED_ORIGINS');
  }

  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

function parseAllowedOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (raw && raw.trim().length > 0) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return ['http://localhost:4200', 'http://localhost'];
}

export async function createApp(): Promise<Express> {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: parseAllowedOrigins() }));
  app.use(express.json());

  app.use('/api/customers', customerRoutes);
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  app.use('/graphql', expressMiddleware(apollo));

  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    const status = err.status ?? 500;
    res.status(status).json({ error: err.message ?? 'Internal Server Error' });
  });

  return app;
}

async function bootstrap(): Promise<void> {
  validateEnv();
  await initDatabase();
  const app = await createApp();
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`Backend ready  ->  http://localhost:${port}`);
    console.log(`GraphQL sandbox ->  http://localhost:${port}/graphql`);
  });
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}
