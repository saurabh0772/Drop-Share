# Drop Share — Security Design

## Purpose

This document defines the initial security requirements for Drop Share.

The goal is to ensure that:

- Only authorized users can access protected operations
- Room access is controlled
- File transfers are private
- Temporary sessions cannot be abused
- Services are protected from common attacks

---

# 1. Authentication

Users should authenticate before accessing protected APIs.

The Auth Service is responsible for:

- Registration
- Login
- Password hashing
- Access token generation
- Token validation

Example:

```text
Client
   |
   | Login
   v
Auth Service
   |
   | Access Token
   v
Client
```

The client sends the access token when calling protected APIs.

---

# 2. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to perform this action?

For example:

```text
User A
   |
   | tries to access
   v
User B's transfer
```

The Transfer Service must reject the request if User A is not authorized.

---

# 3. Room Security

A room should not be accessible simply by knowing an internal database ID.

The system should expose a separate human-readable Room Code.

Example:

```text
DS-7K92X
```

The internal room ID should remain private.

---

# 4. Room Code Security

Room codes should contain enough randomness to make guessing difficult.

The system should not use simple sequential IDs such as:

```text
ROOM-1
ROOM-2
ROOM-3
```

Instead, use randomly generated codes.

Example:

```text
DS-7K92X
DS-M4P8Q
DS-91XZK
```

The exact generation algorithm will be decided during implementation.

---

# 5. Room Expiration

Rooms are temporary.

Example:

```text
Room Created
     |
     v
Active
     |
     | Timeout
     v
Expired
```

Expired rooms should:

- Reject new participants
- Reject new transfers
- Close active signaling sessions
- Eventually be removed from the database/cache

---

# 6. Room Capacity

The initial MVP supports:

```text
1 Sender
1 Receiver
```

If a third participant attempts to join:

```text
Room Full
```

The request should be rejected.

Multi-user transfers can be considered later.

---

# 7. Signaling Security

The Signaling Service uses WebSockets.

A client must authenticate before joining a protected signaling session.

Conceptually:

```text
Client
   |
   | WebSocket + Authentication
   v
Signaling Service
   |
   | Validate identity
   v
Join signaling session
```

The server should verify that:

```text
User
   |
   +-- belongs to -->
                     Room
```

before allowing signaling messages.

---

# 8. Signaling Message Validation

Clients should not be allowed to send arbitrary signaling messages.

The server should validate:

- Message type
- Room ID
- Sender identity
- Target participant
- Message structure

Invalid messages should be rejected.

---

# 9. WebRTC Security

WebRTC connections should use secure transport mechanisms provided by WebRTC.

The application should not implement its own encryption for the underlying WebRTC connection unless there is a specific future requirement.

The initial implementation should rely on WebRTC's secure communication mechanisms.

---

# 10. File Privacy

Drop Share should not permanently store the actual file on the backend.

The preferred architecture is:

```text
Sender
   |
   | Direct P2P
   v
Receiver
```

The server should primarily handle:

```text
Authentication
Room Management
Signaling
Transfer Metadata
```

It should not receive or permanently store the file.

---

# 11. File Metadata Validation

The sender provides metadata such as:

```text
fileName
fileSize
mimeType
chunkSize
totalChunks
```

The server should validate metadata values where they are sent through backend APIs.

Example:

```text
fileSize <= allowed maximum
chunkSize <= allowed maximum
totalChunks is reasonable
```

The client should not be trusted simply because it provides valid-looking metadata.

---

# 12. File Size Limits

The system should define a configurable maximum file size.

Example:

```text
MAX_FILE_SIZE
```

The exact initial value will be decided during implementation/testing.

The limit should be configurable rather than hard-coded throughout the application.

---

# 13. Chunk Validation

The receiver should validate every chunk.

Validation should include:

- Transfer ID
- Chunk index
- Expected chunk size where applicable
- Chunk checksum
- Transfer state

An invalid chunk should not be accepted as valid transfer data.

---

# 14. Transfer Authorization

A transfer belongs to a room.

Therefore:

```text
Transfer
   |
   v
Room
   |
   v
Participants
```

Only participants of that room should be allowed to participate in the transfer.

A user from another room should not be able to access the transfer.

---

# 15. Rate Limiting

Rate limiting should be applied to potentially abusive APIs.

Important targets include:

```text
POST /auth/register
POST /auth/login
POST /rooms
POST /rooms/:roomCode/join
POST /transfers
```

The exact limits will be determined during implementation.

---

# 16. Room Code Guessing Protection

An attacker may repeatedly attempt random Room Codes.

The system should protect against this using:

- Rate limiting
- Request throttling
- Sufficiently random Room Codes
- Room expiration
- Room capacity limits

---

# 17. Input Validation

All client-provided input should be validated.

Examples:

```text
email
password
roomCode
fileName
fileSize
mimeType
chunkSize
transferId
chunkIndex
```

The server should never blindly trust client input.

---

# 18. API Security

Protected APIs should require authentication.

Example:

```text
Authorization: Bearer <token>
```

The API Gateway or appropriate service should verify the authentication information before allowing protected operations.

---

# 19. Internal Service Security

Internal services should not assume that every internal request is trusted.

Future production architecture should consider:

- Internal authentication
- Service-to-service authorization
- Private networking
- Secure service communication

These requirements become more important when multiple service instances are deployed.

---

# 20. TURN Security

TURN infrastructure should not be publicly usable without authorization.

TURN credentials should be temporary and scoped appropriately.

The application should avoid exposing permanent TURN credentials to clients.

---

# 21. Denial-of-Service Considerations

Potential abuse includes:

```text
Create thousands of rooms
Join thousands of rooms
Open many WebSocket connections
Send invalid signaling messages
Create huge transfer sessions
```

Initial protections:

```text
Rate limiting
Room expiration
Room capacity
Input validation
Authentication
Connection limits
```

More advanced protection can be added later.

---

# 22. Sensitive Information

The system should avoid logging sensitive information.

Logs should not contain:

- Passwords
- Access tokens
- Private keys
- File contents
- Sensitive user information

File names should also be treated carefully because they may contain sensitive information.

---

# 23. Security Principle

The system should follow:

```text
Never trust the client.
```

For example:

```text
Client says:

"I am the sender."

        ↓

Server verifies:

Is this user actually the sender
of this room/transfer?
```

The server should verify important authorization decisions independently.

---

# 24. Security Layers

Drop Share security can be viewed as:

```text
                 Security
                    |
       +------------+------------+
       |            |            |
       v            v            v
 Authentication  Authorization  Validation
       |            |            |
       +------------+------------+
                    |
                    v
              Rate Limiting
                    |
                    v
             Secure Signaling
                    |
                    v
              Secure WebRTC
                    |
                    v
             Transfer Integrity
```

---

# 25. Security Priorities

For the MVP, prioritize:

1. Authentication
2. Room authorization
3. Signaling authentication
4. Input validation
5. Room code randomness
6. Rate limiting
7. File metadata validation
8. Chunk integrity
9. Room expiration

Advanced security mechanisms can be introduced later as the architecture grows.