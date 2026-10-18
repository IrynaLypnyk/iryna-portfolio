import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';
import { readLegacyContentReport } from './lib/legacy-content-preflight.mjs';

// Never reads .env or inherited DATABASE_URL: those may point to production.
// Optional argument names a local restored database, not a remote connection.
const expectedDatabase = process.argv[2] ?? 'portfolio_case_study_v2';
const root = fileURLToPath(new URL('../', import.meta.url));
const connectionString = dotenv.parse(readFileSync(resolve(root, '.env.local'))).DATABASE_URL;
try {
  const target = new URL(connectionString);
  if (
    !['postgres:', 'postgresql:'].includes(target.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(target.hostname) ||
    target.pathname !== `/${expectedDatabase}` ||
    [...target.searchParams.keys()].some((key) => key !== 'schema')
  )
    throw new Error('Expected an explicitly named local PostgreSQL database in .env.local');
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const report = await readLegacyContentReport(client);
    if (report.target.database !== expectedDatabase)
      throw new Error('Connected database identity does not match');
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await client.end();
  }
} catch {
  // Do not print connection strings or driver errors that may contain credentials.
  console.error(
    'Preflight failed. Verify the local target, schema and connection. No data was changed.'
  );
  process.exitCode = 1;
}
