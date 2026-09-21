# Drop Share — Repository Structure

## 1. Root Structure

```text
drop-share/
│
├── client/
│
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── room-service/
│   ├── signaling-service/
│   └── transfer-service/
│
├── infrastructure/
│
├── docs/
│
├── README.md
├── .gitignore
└── docker-compose.yml
```

---

# 2. Client

The client contains everything that runs in the user's browser.

```text
client/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── connection/
│   ├── transport/
│   ├── transfer/
│   └── utils/
│
├── public/
├── package.json
└── vite.config.js
```

Responsibilities:

### `components/`

Reusable UI components.

### `pages/`

Application pages such as:

```text
Login
Register
Create Room
Join Room
Transfer
```

### `services/`

HTTP and WebSocket communication with backend services.

### `connection/`

Connection Manager.

Responsible for deciding which transport should be used.

### `transport/`

Transport implementations.

```text
transport/
├── lan/
├── webrtc/
└── relay/
```

### `transfer/`

Transfer Engine.

Responsible for:

- File reading
- Chunking
- Backpressure
- Progress
- Speed calculation
- Integrity verification
- Resume
- File reconstruction

---

# 3. API Gateway

```text
services/api-gateway/
│
├── src/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── app.js
│
├── package.json
└── Dockerfile
```

Responsibilities:

- Public API entry point
- Routing
- Authentication middleware
- Rate limiting
- Request logging
- API versioning

It should not contain business logic belonging to other services.

---

# 4. Auth Service

```text
services/auth-service/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── app.js
│
├── package.json
└── Dockerfile
```

Responsibilities:

- Register
- Login
- Password hashing
- JWT generation
- User identity

Owns:

```text
User
```

---

# 5. Room Service

```text
services/room-service/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── app.js
│
├── package.json
└── Dockerfile
```

Responsibilities:

- Create room
- Join room
- Leave room
- Room expiration
- Participant management
- Room lifecycle

Owns:

```text
Room
Participant
```

---

# 6. Signaling Service

```text
services/signaling-service/
│
├── src/
│   ├── handlers/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── server.js
│
├── package.json
└── Dockerfile
```

Responsibilities:

- WebSocket connections
- Peer discovery
- SDP offer
- SDP answer
- ICE candidates
- Peer disconnect events

The Signaling Service does not receive or store file chunks.

---

# 7. Transfer Service

```text
services/transfer-service/
│
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── app.js
│
├── package.json
└── Dockerfile
```

Responsibilities:

- Create transfer sessions
- Store file metadata
- Track transfer state
- Store resume metadata
- Validate transfer ownership

The Transfer Service does not receive the actual file.

---

# 8. Infrastructure

Infrastructure contains deployment and supporting infrastructure configuration.

```text
infrastructure/
│
├── mongodb/
├── turn/
└── docker/
```

Future infrastructure may include:

```text
redis/
load-balancer/
monitoring/
queue/
```

These should only be added when required.

---

# 9. Service Dependency Rule

Services should depend on contracts, not internal implementation details.

For example:

```text
Room Service
     |
     | API
     v
Auth Service
```

Room Service should not do:

```text
Room Service
     |
     v
Auth Service Database
```

Direct database access between services is forbidden.

---

# 10. Client Dependency Rule

The Transfer Engine should not directly depend on WebRTC.

Incorrect:

```text
Transfer Engine
      |
      v
WebRTC API
```

Preferred:

```text
Transfer Engine
      |
      v
Transport Interface
      |
      +----> LAN
      +----> WebRTC
      +----> Relay
```

This allows the transfer protocol to remain independent of the underlying transport.

---

# 11. Control Plane

The control plane consists of:

```text
API Gateway
     |
     +-- Auth Service
     +-- Room Service
     +-- Transfer Service
     +-- Signaling Service
```

It manages:

- Identity
- Rooms
- Participants
- Signaling
- Transfer metadata
- Session state

---

# 12. Data Plane

The data plane is:

```text
Sender
   |
   | File Chunks
   v
Receiver
```

Possible transports:

```text
LAN
WebRTC
TURN Relay
```

The backend should not become part of the data plane unless the selected transport requires a relay.

---

# 13. Important Boundary

The architecture should maintain this separation:

```text
CONTROL PLANE

Client
  |
  v
Backend
  |
  +-- Authentication
  +-- Room Management
  +-- Signaling
  +-- Transfer Metadata


DATA PLANE

Sender
  |
  +--------------------+
                       |
                       v
                    Receiver
```

This is one of the core architectural characteristics of Drop Share.

---

# 14. Initial Implementation Principle

We will build the system incrementally.

Initial implementation order:

```text
1. Repository setup
2. Backend service skeletons
3. Authentication
4. Room management
5. Signaling
6. WebRTC connection
7. Transfer Engine
8. File chunking
9. Integrity verification
10. Resume
11. LAN optimization
12. TURN fallback
13. Production hardening
```

We will not implement all services simultaneously.

Each component will be implemented and tested before moving to the next dependent component.