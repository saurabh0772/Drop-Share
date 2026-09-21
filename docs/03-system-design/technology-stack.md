# Drop Share — Technology Stack

## 1. Architecture Style

Drop Share will use a service-oriented architecture.

The initial backend will be divided into independently defined services:

```text
API Gateway
    |
    +-- Auth Service
    +-- Room Service
    +-- Signaling Service
    +-- Transfer Service
```

The client contains:

```text
Client
    |
    +-- UI
    +-- Connection Manager
    +-- Transfer Engine
```

The actual file data should travel through the data plane:

```text
Sender <--------------------> Receiver
```

---

# 2. Frontend

## Framework

```text
React
```

## Build Tool

```text
Vite
```

## Language

```text
JavaScript
```

The frontend will handle:

- Authentication UI
- Room creation
- Room joining
- File selection
- Transfer progress
- Connection status
- Transfer controls
- Connection Manager
- Transfer Engine

---

# 3. Backend

## Runtime

```text
Node.js
```

## API Framework

```text
Express.js
```

Express will initially be used for HTTP APIs.

Responsibilities include:

- Authentication APIs
- Room APIs
- Transfer metadata APIs
- Health endpoints
- Request validation
- Middleware

---

# 4. Real-Time Communication

## Signaling

```text
WebSocket
```

WebSocket will be used for:

- Peer discovery
- SDP offer
- SDP answer
- ICE candidates
- Connection state events
- Signaling session management

WebSocket is part of the control plane.

It does **not** carry the actual file data.

---

# 5. Peer-to-Peer Data Transfer

## Primary Technology

```text
WebRTC
```

WebRTC will be used for direct peer-to-peer communication over the internet.

Conceptually:

```text
Sender
   |
   | WebRTC DataChannel
   |
   v
Receiver
```

The actual file chunks will travel through the WebRTC DataChannel when WebRTC is selected.

---

# 6. LAN Transfer

Drop Share should support direct transfer between devices on the same local network.

The exact LAN transport implementation will be decided during implementation after evaluating browser limitations and security requirements.

The Connection Manager will hide the transport details from the Transfer Engine.

Conceptually:

```text
Connection Manager
       |
       +-- LAN Transport
       |
       +-- WebRTC Transport
       |
       +-- TURN Relay
```

---

# 7. TURN

TURN will be used as a relay when direct WebRTC connectivity cannot be established.

```text
Sender
   |
   v
TURN Server
   |
   v
Receiver
```

TURN is infrastructure, not an application microservice.

It does not permanently store files.

---

# 8. Database

## Primary Database

```text
MongoDB
```

MongoDB will initially store application metadata such as:

```text
Users
Rooms
Participants
Transfer Sessions
File Metadata
```

It will not store the actual file contents.

---

# 9. Redis

Redis will **not be required for the first implementation**.

It can be introduced when there is a real requirement for:

- Distributed room state
- Distributed rate limiting
- WebSocket coordination
- Temporary transfer state
- Caching
- Multi-instance coordination

Initial architecture:

```text
Application
     |
     v
MongoDB
```

Later:

```text
Application
     |
 +---+---+
 |       |
Redis  MongoDB
```

---

# 10. Message Queue

A message queue is not part of the initial MVP.

A queue can be introduced later for workloads such as:

- Asynchronous processing
- Notifications
- Background jobs
- Large-scale transfer session processing
- Event-driven workflows

The exact queue technology will be selected when the requirement appears.

---

# 11. Containerization

## Docker

Docker will be used for:

- Backend services
- Local development
- MongoDB
- Future Redis
- TURN infrastructure where appropriate

The goal is to make the development environment reproducible.

---

# 12. Local Development

Docker Compose will initially be used to run infrastructure and local services.

Example:

```text
docker-compose.yml
       |
       +-- MongoDB
       +-- Future Redis
       +-- Future TURN
```

Application services may initially be run directly during development and containerized as the deployment architecture matures.

---

# 13. API Style

HTTP APIs will use:

```text
REST
```

Example:

```text
POST /api/v1/rooms
GET  /api/v1/rooms/:roomCode
POST /api/v1/rooms/:roomCode/join
```

REST is primarily used for the control plane.

---

# 14. API Gateway

The API Gateway will be implemented as a Node.js service.

Responsibilities:

- Request routing
- Authentication forwarding/validation
- Rate limiting
- API versioning
- Request logging
- Common middleware

It should not contain business logic belonging to other services.

---

# 15. Service Communication

Initial communication:

```text
Client
  |
  v
API Gateway
  |
  +----> Auth Service
  |
  +----> Room Service
  |
  +----> Transfer Service
```

Signaling uses:

```text
Client
  |
  | WebSocket
  v
Signaling Service
```

Future asynchronous communication may use a message broker if required.

---

# 16. Authentication

The initial authentication system will use:

```text
JWT
```

Passwords will be securely hashed before storage.

The exact password hashing library and token configuration will be decided during implementation.

---

# 17. File Processing

The client should process files incrementally.

The browser should not load a large file completely into memory.

Conceptually:

```text
File
 |
 v
Read incrementally
 |
 v
Chunk
 |
 v
Transport
 |
 v
Receiver
```

The Transfer Engine will be responsible for this logic.

---

# 18. Client Architecture

The client will be separated into logical modules:

```text
client/
│
├── UI
│
├── Connection Manager
│
├── Transport Layer
│   ├── LAN Transport
│   ├── WebRTC Transport
│   └── TURN/Relay handling
│
└── Transfer Engine
```

The Transfer Engine should not directly depend on WebRTC APIs.

Instead:

```text
Transfer Engine
      |
      v
Transport Interface
      |
      +-- LAN
      +-- WebRTC
      +-- Relay
```

This keeps the transfer protocol independent of the underlying transport.

---

# 19. Backend Service Structure

The backend will use:

```text
services/
│
├── api-gateway/
├── auth-service/
├── room-service/
├── signaling-service/
└── transfer-service/
```

Each service should have its own:

- Source code
- Configuration
- Dependencies
- API boundary
- Database ownership where applicable

---

# 20. Database Ownership

Services should own their data.

Example:

```text
Auth Service
    |
    +-- User data

Room Service
    |
    +-- Room data
    +-- Participant data

Transfer Service
    |
    +-- Transfer data
    +-- File metadata
```

Another service should not directly query another service's database.

Communication should happen through service APIs or messaging.

---

# 21. Initial Technology Summary

| Area | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| API | REST |
| Real-time | WebSocket |
| P2P | WebRTC |
| Database | MongoDB |
| Authentication | JWT |
| Containerization | Docker |
| Local Orchestration | Docker Compose |
| Relay | TURN |
| Cache | Redis — later |
| Message Queue | Later if required |

---

# 22. Technology Principle

Drop Share should follow this rule:

```text
Requirement
    ↓
Architectural need
    ↓
Technology
```

Not:

```text
Technology
    ↓
Find somewhere to use it
```

Therefore technologies such as Redis, Kafka, Kubernetes, or a message queue should only be introduced when the architecture actually requires them.