# Microservices Architecture

## Goal

Drop Share will eventually use a microservice architecture.

The services should be independently deployable and horizontally scalable.

## Planned Services

### API Gateway

Responsibilities:

- Single entry point for client API requests
- Request routing
- Authentication forwarding
- Rate limiting
- Request logging

The API Gateway should not handle file transfer.

---

### Auth Service

Responsibilities:

- User registration
- User authentication
- Token management
- User identity

The Auth Service owns authentication-related data.

---

### Room Service

Responsibilities:

- Create sharing rooms
- Generate room IDs
- Join rooms
- Track room participants
- Track room state
- Room expiration

The Room Service owns room-related data.

---

### Signaling Service

Responsibilities:

- WebSocket connections
- Peer discovery
- WebRTC signaling
- SDP offer exchange
- SDP answer exchange
- ICE candidate exchange
- Peer connection status

The Signaling Service must not permanently store or process file contents.

---

### Transfer Engine

The Transfer Engine is primarily responsible for client-side file transfer.

Responsibilities:

- File reading
- File chunking
- Transfer scheduling
- Backpressure
- Chunk verification
- Transfer progress
- Resume support
- File reconstruction

The Transfer Engine should communicate through a transport abstraction.

---

## Future Infrastructure

The system may later introduce:

- Redis
- Message queues
- Multiple service instances
- Load balancing
- TURN infrastructure
- Observability services

These components should only be introduced when they solve an actual scalability or reliability problem.

## Core Principle

Microservices coordinate the transfer.

Peers transfer the actual file.