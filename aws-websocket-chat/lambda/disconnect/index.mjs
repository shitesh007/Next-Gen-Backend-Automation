/**
 * AutoMind — WebSocket Disconnect Handler
 *
 * Triggered when a client closes the WebSocket connection.
 * Removes the connectionId from DynamoDB to clean up stale references.
 */

import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const dynamo = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  console.log(`[DISCONNECT] connectionId=${connectionId}`);

  try {
    await dynamo.send(new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: {
        connectionId: { S: connectionId },
      },
    }));

    return { statusCode: 200, body: 'Disconnected.' };
  } catch (err) {
    console.error('[DISCONNECT] DynamoDB delete failed:', err);
    return { statusCode: 500, body: 'Disconnect cleanup failed.' };
  }
};
