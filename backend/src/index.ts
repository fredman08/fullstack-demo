import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import customerRoutes from './routes/customers';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { initDatabase, initDynamoDB } from './config/database';

async function bootstrap() {
  await initDatabase();
  await initDynamoDB();

  const app = express();
  app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:80'] }));
  app.use(express.json());

  // REST API — Topic 11: REST
  app.use('/api/customers', customerRoutes);
  app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

  // GraphQL API — Topic 12: GraphQL
  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();
  app.use('/graphql', expressMiddleware(apollo));

  const port = process.env.PORT ?? 4000;
  app.listen(port, () => {
    console.log(`Backend ready  →  http://localhost:${port}`);
    console.log(`GraphQL sandbox →  http://localhost:${port}/graphql`);
  });
}

bootstrap().catch(console.error);
