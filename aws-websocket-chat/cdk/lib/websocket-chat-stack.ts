import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * AutoMind WebSocket Chat Stack
 * 
 * Provisions a serverless real-time chat architecture for the
 * Next-Gen Backend Automation Platform.
 * 
 * Components:
 *  - DynamoDB Connections Table (stores active WebSocket connectionIds)
 *  - API Gateway v2 WebSocket API ($connect, $disconnect, sendMessage)
 *  - 3 Lambda handlers (connect, disconnect, message)
 */
export class WebSocketChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =============================================
    // 1. DynamoDB — Connections Table
    // =============================================
    const connectionsTable = new dynamodb.Table(this, 'AutoMindConnectionsTable', {
      tableName: 'AutoMindConnections',
      partitionKey: {
        name: 'connectionId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,     // For dev — change to RETAIN in prod
      timeToLiveAttribute: 'ttl',                    // Auto-cleanup stale connections
    });

    // =============================================
    // 2. Lambda — Shared Configuration
    // =============================================
    const lambdaDefaults: Partial<lambda.FunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      logRetention: logs.RetentionDays.ONE_WEEK,
      environment: {
        TABLE_NAME: connectionsTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
    };

    // --- Connect Lambda ---
    const connectHandler = new lambda.Function(this, 'ConnectHandler', {
      ...lambdaDefaults,
      functionName: 'AutoMind-WS-Connect',
      description: 'Stores connectionId in DynamoDB when a client connects',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/connect')),
    });

    // --- Disconnect Lambda ---
    const disconnectHandler = new lambda.Function(this, 'DisconnectHandler', {
      ...lambdaDefaults,
      functionName: 'AutoMind-WS-Disconnect',
      description: 'Removes connectionId from DynamoDB when a client disconnects',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/disconnect')),
    });

    // --- Message Lambda ---
    const messageHandler = new lambda.Function(this, 'MessageHandler', {
      ...lambdaDefaults,
      functionName: 'AutoMind-WS-Message',
      description: 'Processes prompts via AI and sends generated code back to client',
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(60),   // Longer timeout for AI processing
      memorySize: 512,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda/message')),
      environment: {
        ...lambdaDefaults.environment!,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      },
    });

    // Grant DynamoDB permissions
    connectionsTable.grantReadWriteData(connectHandler);
    connectionsTable.grantReadWriteData(disconnectHandler);
    connectionsTable.grantReadWriteData(messageHandler);

    // =============================================
    // 3. API Gateway v2 — WebSocket API
    // =============================================
    const webSocketApi = new apigatewayv2.CfnApi(this, 'AutoMindWebSocketApi', {
      name: 'AutoMindChat',
      protocolType: 'WEBSOCKET',
      routeSelectionExpression: '$request.body.action',
      description: 'WebSocket API for AutoMind real-time chat interactions',
    });

    // --- Lambda Integrations ---
    const connectIntegration = new apigatewayv2.CfnIntegration(this, 'ConnectIntegration', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${connectHandler.functionArn}/invocations`,
    });

    const disconnectIntegration = new apigatewayv2.CfnIntegration(this, 'DisconnectIntegration', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${disconnectHandler.functionArn}/invocations`,
    });

    const messageIntegration = new apigatewayv2.CfnIntegration(this, 'MessageIntegration', {
      apiId: webSocketApi.ref,
      integrationType: 'AWS_PROXY',
      integrationUri: `arn:aws:apigateway:${this.region}:lambda:path/2015-03-31/functions/${messageHandler.functionArn}/invocations`,
    });

    // --- Routes ---
    const connectRoute = new apigatewayv2.CfnRoute(this, 'ConnectRoute', {
      apiId: webSocketApi.ref,
      routeKey: '$connect',
      authorizationType: 'NONE',
      target: `integrations/${connectIntegration.ref}`,
    });

    const disconnectRoute = new apigatewayv2.CfnRoute(this, 'DisconnectRoute', {
      apiId: webSocketApi.ref,
      routeKey: '$disconnect',
      target: `integrations/${disconnectIntegration.ref}`,
    });

    const messageRoute = new apigatewayv2.CfnRoute(this, 'SendMessageRoute', {
      apiId: webSocketApi.ref,
      routeKey: 'sendMessage',
      target: `integrations/${messageIntegration.ref}`,
    });

    // --- Deployment & Stage ---
    const deployment = new apigatewayv2.CfnDeployment(this, 'WebSocketDeployment', {
      apiId: webSocketApi.ref,
    });
    deployment.addDependency(connectRoute);
    deployment.addDependency(disconnectRoute);
    deployment.addDependency(messageRoute);

    const stage = new apigatewayv2.CfnStage(this, 'ProductionStage', {
      apiId: webSocketApi.ref,
      stageName: 'production',
      deploymentId: deployment.ref,
      defaultRouteSettings: {
        loggingLevel: 'INFO',
        dataTraceEnabled: true,
        throttlingBurstLimit: 500,
        throttlingRateLimit: 1000,
      },
    });

    // --- API Gateway → Lambda Invoke Permissions ---
    const apiArn = `arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.ref}/*`;

    connectHandler.addPermission('AllowApiGatewayConnect', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: apiArn,
    });
    disconnectHandler.addPermission('AllowApiGatewayDisconnect', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: apiArn,
    });
    messageHandler.addPermission('AllowApiGatewayMessage', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: apiArn,
    });

    // --- Grant Message Lambda permission to post back to WebSocket clients ---
    const manageConnectionsPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['execute-api:ManageConnections'],
      resources: [
        `arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.ref}/production/POST/@connections/*`,
      ],
    });
    messageHandler.addToRolePolicy(manageConnectionsPolicy);

    // Add the WebSocket callback URL as an environment variable for the message handler
    const callbackUrl = `https://${webSocketApi.ref}.execute-api.${this.region}.amazonaws.com/production`;
    messageHandler.addEnvironment('WEBSOCKET_ENDPOINT', callbackUrl);

    // =============================================
    // 4. Stack Outputs
    // =============================================
    new cdk.CfnOutput(this, 'WebSocketURL', {
      value: `wss://${webSocketApi.ref}.execute-api.${this.region}.amazonaws.com/production`,
      description: 'WebSocket connection URL for AutoMind Chat',
      exportName: 'AutoMindWebSocketURL',
    });

    new cdk.CfnOutput(this, 'ConnectionsTableName', {
      value: connectionsTable.tableName,
      description: 'DynamoDB table storing active connections',
    });

    new cdk.CfnOutput(this, 'WebSocketApiId', {
      value: webSocketApi.ref,
      description: 'API Gateway WebSocket API ID',
    });
  }
}
