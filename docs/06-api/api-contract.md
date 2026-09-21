# Drop Share — API Contract

## Purpose

This document defines the initial communication contracts between the Drop Share client and backend services.

The API is divided according to service ownership.

---

# 1. API Gateway

The client communicates with the API Gateway rather than directly calling internal services.

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

The API Gateway exposes the public API.

---

# 2. Authentication APIs

Owned by:

```text
Auth Service
```

## Register

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "Saurabh",
  "email": "saurabh@example.com",
  "password": "********"
}
```

Response:

```json
{
  "user": {
    "id": "user_id",
    "name": "Saurabh",
    "email": "saurabh@example.com"
  }
}
```

---

## Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "saurabh@example.com",
  "password": "********"
}
```

Response:

```json
{
  "accessToken": "token",
  "user": {
    "id": "user_id",
    "name": "Saurabh",
    "email": "saurabh@example.com"
  }
}
```

---

## Get Current User

```http
GET /api/v1/auth/me
```

Response:

```json
{
  "user": {
    "id": "user_id",
    "name": "Saurabh",
    "email": "saurabh@example.com"
  }
}
```

---

# 3. Room APIs

Owned by:

```text
Room Service
```

---

## Create Room

```http
POST /api/v1/rooms
```

Request:

```json
{}
```

Response:

```json
{
  "roomId": "room_internal_id",
  "roomCode": "DS-7K92X",
  "status": "WAITING",
  "expiresAt": "2026-09-21T16:00:00Z"
}
```

---

## Get Room

```http
GET /api/v1/rooms/:roomCode
```

Response:

```json
{
  "roomCode": "DS-7K92X",
  "status": "WAITING",
  "participants": 1,
  "expiresAt": "2026-09-21T16:00:00Z"
}
```

---

## Join Room

```http
POST /api/v1/rooms/:roomCode/join
```

Request:

```json
{
  "deviceId": "device_id"
}
```

Response:

```json
{
  "roomCode": "DS-7K92X",
  "status": "PEER_CONNECTED"
}
```

---

## Leave Room

```http
POST /api/v1/rooms/:roomCode/leave
```

Response:

```json
{
  "message": "Left room successfully"
}
```

---

# 4. Signaling Connection

Owned by:

```text
Signaling Service
```

Signaling uses WebSocket instead of normal REST APIs.

Connection:

```text
wss://api.example.com/signaling
```

After connecting, the client identifies itself:

```json
{
  "type": "JOIN_ROOM",
  "roomCode": "DS-7K92X",
  "participantId": "participant_id"
}
```

---

# 5. Signaling Messages

## PEER_JOINED

Sent when another participant joins the room.

```json
{
  "type": "PEER_JOINED",
  "participantId": "participant_id"
}
```

---

## OFFER

Sender sends the WebRTC SDP offer.

```json
{
  "type": "OFFER",
  "target": "participant_id",
  "payload": {}
}
```

---

## ANSWER

Receiver sends the WebRTC SDP answer.

```json
{
  "type": "ANSWER",
  "target": "participant_id",
  "payload": {}
}
```

---

## ICE_CANDIDATE

Peers exchange ICE candidates.

```json
{
  "type": "ICE_CANDIDATE",
  "target": "participant_id",
  "payload": {}
}
```

---

## PEER_DISCONNECTED

Sent when a participant disconnects.

```json
{
  "type": "PEER_DISCONNECTED",
  "participantId": "participant_id"
}
```

---

# 6. Transfer APIs

Owned by:

```text
Transfer Service
```

The Transfer Service manages transfer metadata.

It does NOT receive file chunks.

---

## Create Transfer Session

```http
POST /api/v1/transfers
```

Request:

```json
{
  "roomCode": "DS-7K92X",
  "fileName": "ubuntu.iso",
  "fileSize": 4509715660,
  "mimeType": "application/octet-stream",
  "chunkSize": 10485760,
  "totalChunks": 430
}
```

Response:

```json
{
  "transferId": "transfer_id",
  "status": "READY"
}
```

---

## Get Transfer

```http
GET /api/v1/transfers/:transferId
```

Response:

```json
{
  "transferId": "transfer_id",
  "fileName": "ubuntu.iso",
  "fileSize": 4509715660,
  "chunkSize": 10485760,
  "totalChunks": 430,
  "status": "TRANSFERRING"
}
```

---

## Update Transfer State

```http
PATCH /api/v1/transfers/:transferId
```

Request:

```json
{
  "status": "COMPLETED"
}
```

Response:

```json
{
  "transferId": "transfer_id",
  "status": "COMPLETED"
}
```

---

# 7. Actual File Transfer

The actual file data does NOT use the REST API.

It is transferred through the established transport.

```text
Sender
   |
   | File chunks
   v
Transport
   |
   v
Receiver
```

Possible transports:

```text
LAN
WebRTC P2P
TURN Relay
```

The backend does not receive:

```text
POST /upload
```

and does not store:

```text
file chunks
```

---

# 8. Client-Side Transfer Protocol

Once the transport connection is ready, the Transfer Engine uses its own protocol.

The initial protocol messages are:

```text
TRANSFER_INIT
CHUNK
CHUNK_ACK
TRANSFER_PAUSE
TRANSFER_RESUME
TRANSFER_COMPLETE
TRANSFER_ERROR
```

---

## TRANSFER_INIT

Sender informs the receiver about the file.

```json
{
  "type": "TRANSFER_INIT",
  "transferId": "transfer_id",
  "fileName": "ubuntu.iso",
  "fileSize": 4509715660,
  "chunkSize": 10485760,
  "totalChunks": 430
}
```

---

## CHUNK

Represents one file chunk.

Conceptually:

```text
Chunk metadata
+
Binary chunk data
```

Example metadata:

```json
{
  "type": "CHUNK",
  "transferId": "transfer_id",
  "chunkIndex": 42,
  "checksum": "sha256..."
}
```

The actual chunk data is transmitted as binary data through the transport.

---

## CHUNK_ACK

Receiver confirms successful processing of a chunk.

```json
{
  "type": "CHUNK_ACK",
  "transferId": "transfer_id",
  "chunkIndex": 42
}
```

---

## TRANSFER_COMPLETE

Sent when all chunks have been received and verified.

```json
{
  "type": "TRANSFER_COMPLETE",
  "transferId": "transfer_id"
}
```

---

# 9. Error Response Format

REST APIs should use a consistent error structure.

Example:

```json
{
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "The requested room does not exist."
  }
}
```

Possible error codes:

```text
AUTH_REQUIRED
INVALID_TOKEN
ROOM_NOT_FOUND
ROOM_EXPIRED
ROOM_FULL
TRANSFER_NOT_FOUND
TRANSFER_NOT_ALLOWED
INVALID_TRANSFER_STATE
```

---

# 10. API Ownership Summary

| API | Service |
|---|---|
| `/auth/*` | Auth Service |
| `/rooms/*` | Room Service |
| `/transfers/*` | Transfer Service |
| `/signaling` | Signaling Service |
| File chunks | Client-to-client transport |

---

# Important Architectural Rule

REST APIs handle:

```text
Control Plane
```

WebSocket handles:

```text
Signaling
```

P2P transport handles:

```text
Data Plane
```

Therefore:

```text
             CONTROL PLANE
                  |
        +---------+---------+
        |         |         |
       Auth      Room    Transfer
        |         |         |
        +---------+---------+
                  |
             Signaling
                  |
                  v
            Connection Setup
                  |
                  v

              DATA PLANE

       Sender ═════════ Receiver
                File
               Chunks
```