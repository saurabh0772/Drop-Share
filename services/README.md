# Drop Share Backend Services

The `services/` directory contains the backend services of Drop Share.

## Services

```text
api-gateway
auth-service
room-service
signaling-service
transfer-service
```

## Responsibility

### API Gateway

Public entry point for backend APIs.

### Auth Service

Handles authentication and user identity.

### Room Service

Handles rooms and participants.

### Signaling Service

Handles WebSocket-based peer signaling.

### Transfer Service

Handles transfer session and file metadata.

## Principle

Services communicate through defined APIs or messaging.

A service must not directly access another service's database.