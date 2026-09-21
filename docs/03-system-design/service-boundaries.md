# Drop Share — Service Boundaries

## Goal

Each service should have one clear responsibility.

A service should own its own business logic and data.

Services must communicate through APIs, WebSockets, or messaging rather than directly accessing another service's database.

---

# 1. API Gateway

## Responsibility

The API Gateway is the single HTTP entry point for the client.

It routes requests to the appropriate backend service.

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

## Responsibilities

- Request routing
- Authentication forwarding
- Rate limiting
- Request validation where appropriate
- API versioning
- Centralized request logging

## Does NOT

- Store files
- Manage WebRTC signaling logic
- Manage room business logic
- Transfer file chunks

---

# 2. Auth Service

## Responsibility

Manage user identity and authentication.

## Responsibilities

- User registration
- User login
- Password hashing
- Token generation
- Token validation
- User identity

## Owns

```text
User
```

## Does NOT

- Manage rooms
- Manage WebRTC connections
- Transfer files

---

# 3. Room Service

## Responsibility

Manage sharing rooms and their participants.

## Responsibilities

- Create rooms
- Generate room IDs
- Validate room IDs
- Join rooms
- Manage participants
- Track room lifecycle
- Handle room expiration
- Maintain room state

## Owns

```text
Room
Participant
```

## Example APIs

```text
POST   /rooms
GET    /rooms/:roomId
POST   /rooms/:roomId/join
DELETE /rooms/:roomId
```

## Does NOT

- Transfer file chunks
- Store files
- Perform WebRTC negotiation itself

---

# 4. Signaling Service

## Responsibility

Help peers establish a connection.

The Signaling Service primarily uses WebSockets.

## Responsibilities

- Maintain peer WebSocket connections
- Notify peers when another participant joins
- Exchange WebRTC offers
- Exchange WebRTC answers
- Exchange ICE candidates
- Notify peers when a connection is closed

## Example Signaling Messages

```text
PEER_JOINED
OFFER
ANSWER
ICE_CANDIDATE
PEER_DISCONNECTED
```

## Does NOT

- Store files
- Transfer file chunks
- Permanently store WebRTC session data
- Decide which chunks should be retransmitted

The Signaling Service only helps establish communication.

---

# 5. Transfer Service

## Responsibility

Manage transfer-session metadata and transfer-related business logic.

## Responsibilities

- Create transfer sessions
- Store file metadata
- Track transfer lifecycle
- Validate transfer permissions
- Manage transfer state
- Coordinate resume information
- Record transfer completion/failure

## Owns

```text
TransferSession
FileMetadata
```

## Important

The Transfer Service does NOT receive the actual file.

It manages metadata about the file transfer.

---

# 6. Client Transfer Engine

The actual file-transfer engine primarily runs on the client devices.

## Responsibilities

- Read files incrementally
- Split files into chunks
- Send chunks
- Receive chunks
- Apply backpressure
- Track transferred chunks
- Verify chunks
- Resume interrupted transfers
- Reconstruct files
- Calculate transfer speed
- Report transfer progress

The client communicates with the selected transport.

```text
Transfer Engine
       |
       v
Transport
```

---

# 7. Connection Manager

The Connection Manager is responsible for selecting and establishing the best available transport.

## Responsibilities

- Detect available connectivity
- Determine whether LAN connectivity is possible
- Attempt direct WebRTC connectivity
- Fall back to TURN when necessary
- Return an established transport to the Transfer Engine

## Connection Priority

```text
LAN P2P
   |
   v
Direct WebRTC P2P
   |
   v
TURN Relay
```

## Important

The Connection Manager should hide transport-specific details from the Transfer Engine.

The Transfer Engine should not need to know whether the connection is LAN, WebRTC, or TURN.

---

# 8. TURN Infrastructure

TURN is infrastructure rather than a normal application microservice.

## Responsibility

Relay WebRTC traffic when a direct peer-to-peer connection cannot be established.

```text
Sender
   |
   v
TURN
   |
   v
Receiver
```

## Important

TURN should not permanently store the transferred file.

It only relays traffic during the active connection.

---

# Service Interaction

The overall architecture is:

```text
                         Client
                           |
                           v
                    +--------------+
                    | API Gateway  |
                    +------+-------+
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
     Auth Service     Room Service    Transfer Service


Sender/Receiver
      |
      | WebSocket
      v
Signaling Service
      |
      | WebRTC negotiation
      v
Connection Manager
      |
      +------ LAN P2P
      |
      +------ WebRTC P2P
      |
      +------ TURN Relay
      |
      v
Transfer Engine
      |
      v
Actual File Transfer
```

---

# Data Ownership

```text
Auth Service
    |
    +-- User


Room Service
    |
    +-- Room
    +-- Participant


Transfer Service
    |
    +-- TransferSession
    +-- FileMetadata


Client
    |
    +-- Actual File
    +-- Transfer Chunks
    +-- Temporary Transfer State
```

---

# Core Architectural Rule

The most important rule in Drop Share is:

```text
Backend coordinates.
Peers transfer.
```

The backend handles:

```text
Authentication
Room Management
Peer Discovery
Signaling
Transfer Metadata
```

The peers handle:

```text
File Reading
Chunking
File Transfer
Chunk Verification
Resume
File Reconstruction
```

---

# Future Services

The following services or infrastructure may be introduced later:

```text
Redis
Message Queue
Notification Service
Analytics Service
Observability Stack
Multiple Signaling Instances
Multiple Room Service Instances
```

These should only be introduced when the system has a concrete requirement for them.