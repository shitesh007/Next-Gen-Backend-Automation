# 🔌 AutoMind — Serverless WebSocket Chat Architecture

> Real-time interaction layer for the Next-Gen Backend Automation Platform.
> Users send plain English prompts via WebSocket → AI generates backend schemas → Results streamed back instantly.

## Architecture

```
┌─────────────┐       WebSocket        ┌──────────────────────────┐
│   Frontend   │◄─────────────────────►│  API Gateway (WebSocket) │
│  (React.js)  │   wss://...           │                          │
└─────────────┘                        │  $connect                │
                                       │  $disconnect             │
                                       │  sendMessage             │
                                       └──────┬───────────────────┘
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        │                     │                     │
                   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
                   │ Connect │          │ Disconnect│        │  Message  │
                   │ Lambda  │          │  Lambda   │        │  Lambda   │
                   └────┬────┘          └─────┬─────┘        └─────┬─────┘
                        │                     │                     │
                        └─────────┬───────────┘                    │
                                  │                                │
                          ┌───────▼───────┐               ┌───────▼───────┐
                          │   DynamoDB    │               │  Gemini AI    │
                          │ Connections   │               │   (Schema     │
                          │   Table       │               │  Generation)  │
                          └───────────────┘               └───────────────┘
```

## Directory Structure

```
aws-websocket-chat/
├── cdk/                          # AWS CDK Infrastructure
│   ├── bin/app.ts               # CDK app entry point
│   ├── lib/
│   │   └── websocket-chat-stack.ts  # Full stack definition
│   ├── package.json
│   ├── tsconfig.json
│   └── cdk.json
│
└── lambda/                       # Lambda Handlers
    ├── connect/
    │   └── index.mjs            # Stores connectionId in DynamoDB
    ├── disconnect/
    │   └── index.mjs            # Removes connectionId from DynamoDB
    └── message/
        └── index.mjs           # AI processing + sends results back
```

## Deployment

### Prerequisites
- AWS CLI configured (`aws configure`)
- Node.js 20+
- AWS CDK CLI (`npm install -g aws-cdk`)

### Steps

```bash
# 1. Install CDK dependencies
cd aws-websocket-chat/cdk
npm install

# 2. Bootstrap CDK (first time only)
cdk bootstrap

# 3. Set your Gemini API key
export GEMINI_API_KEY=your_api_key_here

# 4. Deploy
cdk deploy
```

### Output
After deployment, CDK will output:
- **WebSocketURL**: `wss://xxx.execute-api.region.amazonaws.com/production`
- **ConnectionsTableName**: `AutoMindConnections`

## Client Usage

### Connect
```javascript
const ws = new WebSocket('wss://YOUR_API_ID.execute-api.ap-south-1.amazonaws.com/production');
```

### Send a Prompt
```javascript
ws.send(JSON.stringify({
  action: 'sendMessage',
  prompt: 'Build a task manager with Users, Projects, and Tasks'
}));
```

### Receive Responses
```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'status':   // Processing acknowledgement
    case 'schema':   // Generated JSON schema
    case 'summary':  // Endpoint summary + feature list
    case 'error':    // Error message
  }
};
```

## Cleanup

```bash
cd aws-websocket-chat/cdk
cdk destroy
```
