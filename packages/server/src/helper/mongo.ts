import { MongoClient, ServerApiVersion } from 'mongodb';
import type { Collection } from 'mongodb';
import type { Schema } from '@mutual-fund/shared';

export async function connect() {
  const client = new MongoClient('mongodb://localhost:27017', {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
    },
  });
  await client.connect();
  return client;
}
export function collection<T extends keyof Schema>(
  client: MongoClient,
  dbName: T
): Collection<Schema[T]> {
  const database = client.db('mutual_funds');
  return database.collection<Schema[T]>(dbName);
}
