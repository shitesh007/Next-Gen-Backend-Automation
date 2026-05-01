#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WebSocketChatStack } from '../lib/websocket-chat-stack';

const app = new cdk.App();

new WebSocketChatStack(app, 'AutoMindWebSocketChatStack', {
  description: 'AutoMind — Serverless WebSocket Chat for real-time backend code generation',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-south-1',
  },
  tags: {
    Project: 'AutoMind',
    Component: 'WebSocketChat',
    Environment: 'production',
  },
});
