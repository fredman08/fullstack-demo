import { pgPool } from '../config/database';

export interface AuditEntry {
  action: string;
  timestamp: string;
}

export async function logAudit(
  customerId: number,
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await pgPool.query(
    'INSERT INTO audit_log (customer_id, action, payload) VALUES ($1, $2, $3)',
    [customerId, action, payload],
  );
}

export async function getAuditLog(customerId: number): Promise<AuditEntry[]> {
  try {
    const result = await pgPool.query<{ action: string; timestamp: Date }>(
      'SELECT action, timestamp FROM audit_log WHERE customer_id = $1 ORDER BY timestamp DESC',
      [customerId],
    );
    return result.rows.map((r) => ({
      action: r.action,
      timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : String(r.timestamp),
    }));
  } catch (err) {
    console.error('getAuditLog failed:', err);
    return [];
  }
}
