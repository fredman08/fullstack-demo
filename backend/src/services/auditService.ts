import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDoc } from '../config/database';

// Topic 14: DynamoDB — NoSQL audit log (pk/sk = partition + sort key)
const TABLE = process.env.AUDIT_TABLE ?? 'customer_audit';

export interface AuditEntry {
  action: string;
  timestamp: string;
}

export async function logAudit(
  customerId: number,
  action: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const now = new Date().toISOString();
  await dynamoDoc.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        pk: `CUSTOMER#${customerId}`,   // partition key — like CHAIN key in RPG
        sk: `AUDIT#${now}`,             // sort key — keeps entries ordered by time
        action,
        payload,
        timestamp: now,
      },
    }),
  );
}

export async function getAuditLog(customerId: number): Promise<AuditEntry[]> {
  try {
    const result = await dynamoDoc.send(
      new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `CUSTOMER#${customerId}`,
          ':skPrefix': 'AUDIT#',
        },
        ScanIndexForward: false, // newest first
      }),
    );
    return (result.Items ?? []) as AuditEntry[];
  } catch {
    return []; // DynamoDB unavailable — degrade gracefully
  }
}
