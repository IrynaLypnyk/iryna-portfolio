import { Pool } from 'pg';

// Registration and cleanup of the same ImageKit file must not race. A session
// lock spans the committed DB deletion and the remote request without keeping
// a Prisma transaction open during network I/O. No queue or asset states needed.
const globalForMedia = globalThis as unknown as { mediaLockPool?: Pool };
const pool =
  globalForMedia.mediaLockPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 2,
    connectionTimeoutMillis: 5_000,
    statement_timeout: 15_000,
    idleTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  });
if (!globalForMedia.mediaLockPool) {
  pool.on('error', (error) => console.error('Media file lock connection failed:', error));
  globalForMedia.mediaLockPool = pool;
}

export async function withMediaFileLock<T>(fileId: string, action: () => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query('SELECT pg_advisory_lock(hashtextextended($1, 0))', [
      `imagekit-file:${fileId}`,
    ]);
    return await action();
  } finally {
    try {
      await client.query('SELECT pg_advisory_unlock(hashtextextended($1, 0))', [
        `imagekit-file:${fileId}`,
      ]);
    } catch {
      discard = true;
    }
    client.release(discard);
  }
}
