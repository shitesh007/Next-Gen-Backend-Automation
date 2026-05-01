/**
 * AutoMind — WebSocket Connect Handler
 *
 * Triggered when a client opens a WebSocket connection.
 * Stores the connectionId in DynamoDB with a 24-hour TTL.
 */

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const timestamp = new Date().toISOString();

  // TTL: auto-expire connection records after 24 hours
  const ttl = Math.floor(Date.now() / 1000) + 86400;

  console.log(`[CONNECT] connectionId=${connectionId} at ${timestamp}`);

  try {
    await dynamo.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        connectionId: { S: connectionId },
        connectedAt: { S: timestamp },
        ttl:          { N: String(ttl) },
      },
    }));

    return { statusCode: 200, body: 'Connected.' };
  } catch (err) {
    console.error('[CONNECT] DynamoDB write failed:', err);
    return { statusCode: 500, body: 'Connection registration failed.' };
  }
};
