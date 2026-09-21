# Drop Share — File Transfer Protocol

## Purpose

This document defines how Drop Share transfers large files between two connected peers.

The protocol operates on top of the selected transport:

```text
LAN P2P
   |
   +-- or --
   |
WebRTC P2P
   |
   +-- or --
   |
TURN Relay
```

The Transfer Engine should not need to know which transport is being used.

---

# 1. Transfer Architecture

Once a connection is established:

```text
Sender
   |
   v
Transfer Engine
   |
   v
Transport
   |
   v
Receiver
   |
   v
Transfer Engine
```

The backend is not involved in the actual file data transfer.

---

# 2. File Transfer Flow

The transfer follows these stages:

```text
1. Transfer Initialization
2. File Metadata Exchange
3. Chunk Transfer
4. Chunk Verification
5. Progress Tracking
6. Transfer Completion
7. File Reconstruction
```

---

# 3. Transfer Initialization

The sender first creates a transfer session through the Transfer Service.

```text
Sender
   |
   | POST /transfers
   v
Transfer Service
   |
   | transferId
   v
Sender
```

The Transfer Service returns:

```text
transferId
```

The actual file is not sent to the service.

---

# 4. File Metadata

The sender sends file metadata to the receiver through the established P2P transport.

Example:

```json
{
  "type": "TRANSFER_INIT",
  "transferId": "transfer_123",
  "fileName": "ubuntu.iso",
  "fileSize": 4509715660,
  "mimeType": "application/octet-stream",
  "chunkSize": 10485760,
  "totalChunks": 430
}
```

The receiver uses this information to prepare for the transfer.

---

# 5. Chunk Size

The initial target chunk size is:

```text
10 MB
```

This is not a permanent value.

The implementation should make the chunk size configurable.

Example:

```text
chunkSize = 10 MB
```

For a 4.2 GB file:

```text
File Size = 4.2 GB
Chunk Size = 10 MB

Total Chunks ≈ 430
```

The final chunk may be smaller than the configured chunk size.

---

# 6. Why Chunking?

Large files should not be transferred as one huge data object.

Instead:

```text
Large File
    |
    v
+---------+
| Chunk 0 |
+---------+
| Chunk 1 |
+---------+
| Chunk 2 |
+---------+
|   ...   |
+---------+
| Chunk N |
+---------+
```

Benefits:

- Lower memory usage
- Progress tracking
- Resume support
- Chunk-level verification
- Retry of failed chunks
- Better control over transfer flow

---

# 7. Chunk Structure

Each chunk contains metadata and binary data.

Conceptually:

```text
+----------------------+
| Chunk Metadata       |
+----------------------+
| Chunk Binary Data    |
+----------------------+
```

Metadata:

```json
{
  "type": "CHUNK",
  "transferId": "transfer_123",
  "chunkIndex": 42,
  "checksum": "sha256..."
}
```

The actual chunk data is transferred as binary data.

---

# 8. Chunk Ordering

Every chunk has a unique index.

Example:

```text
Chunk 0
Chunk 1
Chunk 2
Chunk 3
...
Chunk 429
```

The receiver should be able to identify each chunk using:

```text
chunkIndex
```

Chunks do not necessarily need to arrive in sequential order.

The receiver should be able to store chunks according to their index.

---

# 9. Chunk Verification

Each chunk should have an integrity checksum.

Example:

```text
Sender
   |
   | Calculate checksum
   v
SHA-256(chunk)
   |
   v
Send chunk + checksum
   |
   v
Receiver
   |
   | Calculate checksum
   v
Compare
```

If:

```text
expectedChecksum == receivedChecksum
```

then:

```text
Chunk valid ✓
```

Otherwise:

```text
Chunk invalid ✗
```

The invalid chunk should be transferred again.

---

# 10. Chunk Acknowledgement

After successfully processing a chunk, the receiver can acknowledge it.

```json
{
  "type": "CHUNK_ACK",
  "transferId": "transfer_123",
  "chunkIndex": 42
}
```

The sender can use acknowledgements to track successful transfer.

---

# 11. Backpressure

The sender must not continuously push data without considering the receiver's ability to process it.

Conceptually:

```text
Read Chunk
    |
    v
Check Transport Buffer
    |
    +---- Buffer Available ----> Send
    |
    +---- Buffer Full ---------> Wait
```

For WebRTC DataChannel, the implementation should monitor:

```text
bufferedAmount
```

The sender should pause sending when the buffer becomes too large and resume when enough buffer space becomes available.

This prevents unnecessary memory growth.

---

# 12. Sequential Transfer — Initial Implementation

The first implementation should use controlled sequential transfer.

Conceptually:

```text
Read Chunk 0
    |
    v
Send Chunk 0
    |
    v
Receive ACK
    |
    v
Read Chunk 1
    |
    v
Send Chunk 1
    |
    v
Receive ACK
    |
    v
...
```

This is intentionally simple.

Once this works reliably, concurrent chunk transfer can be introduced as an optimization.

---

# 13. Transfer Progress

Progress can be calculated using:

```text
transferredBytes / totalFileSize
```

Example:

```text
Transferred = 500 MB
Total = 1 GB

Progress = 48.8%
```

The client should display:

```text
Progress
Speed
Transferred bytes
Remaining bytes
Estimated time remaining
```

---

# 14. Transfer Speed

The client can calculate transfer speed over a time interval.

Conceptually:

```text
Speed = BytesTransferred / TimeElapsed
```

Example:

```text
Transferred:
100 MB

Time:
5 seconds

Speed:
20 MB/s
```

The UI can display both:

```text
Current Speed
Average Speed
```

---

# 15. Resume Support

The receiver maintains information about successfully received chunks.

Example:

```text
0 ✓
1 ✓
2 ✓
3 ✓
4 ✓
5 ✗
6 ✓
7 ✓
```

If the connection fails, the receiver can report its current state after reconnecting.

The sender determines which chunks are missing.

Example:

```text
Receiver has:

0,1,2,3,4,6,7

Missing:

5
```

The sender retransmits only the missing chunk.

---

# 16. Resume Handshake

After reconnecting:

```text
Receiver
   |
   | RESUME_REQUEST
   v
Sender
```

Example:

```json
{
  "type": "RESUME_REQUEST",
  "transferId": "transfer_123",
  "receivedChunks": [0, 1, 2, 3, 4, 6, 7]
}
```

The sender determines the missing chunks.

Then:

```text
Sender
   |
   | RESUME_RESPONSE
   v
Receiver
```

Example:

```json
{
  "type": "RESUME_RESPONSE",
  "transferId": "transfer_123",
  "missingChunks": [5]
}
```

The sender then transfers the missing chunks.

---

# 17. Transfer Completion

After all chunks have been received and verified:

```json
{
  "type": "TRANSFER_COMPLETE",
  "transferId": "transfer_123"
}
```

The receiver verifies that:

```text
Received Chunks == Total Chunks
```

and then reconstructs the file.

---

# 18. File Reconstruction

The receiver reconstructs the original file according to chunk order.

```text
Chunk 0
   +
Chunk 1
   +
Chunk 2
   +
...
Chunk N
   |
   v
Original File
```

The implementation should avoid loading the entire file into memory.

The final data should be written incrementally where the platform allows it.

---

# 19. Complete Protocol

The initial protocol flow is:

```text
Sender                         Receiver
   |                              |
   |------ TRANSFER_INIT -------->|
   |                              |
   |------ CHUNK 0 -------------->|
   |<----- CHUNK_ACK 0 -----------|
   |                              |
   |------ CHUNK 1 -------------->|
   |<----- CHUNK_ACK 1 -----------|
   |                              |
   |------ CHUNK 2 -------------->|
   |<----- CHUNK_ACK 2 -----------|
   |                              |
   |            ...               |
   |                              |
   |------ CHUNK N -------------->|
   |<----- CHUNK_ACK N -----------|
   |                              |
   |------ TRANSFER_COMPLETE ----->|
   |                              |
   |<----- COMPLETE_ACK -----------|
   |                              |
   |         File Ready            |
```

---

# 20. Connection Failure

If the connection fails:

```text
TRANSFER
   |
   X
Connection lost
   |
   v
PAUSED
```

The client keeps the current transfer state.

After reconnection:

```text
PAUSED
   |
   v
RESUME_REQUEST
   |
   v
Find missing chunks
   |
   v
Continue transfer
```

The transfer should not restart from zero.

---

# 21. Protocol Message Types

Initial message types:

```text
TRANSFER_INIT

CHUNK

CHUNK_ACK

RESUME_REQUEST

RESUME_RESPONSE

TRANSFER_PAUSE

TRANSFER_RESUME

TRANSFER_COMPLETE

COMPLETE_ACK

TRANSFER_ERROR
```

---

# 22. Important Separation

The Transfer Protocol is independent of the transport.

```text
             Transfer Protocol
                     |
                     v
                Transport
                     |
        +------------+------------+
        |            |            |
        v            v            v
       LAN        WebRTC        TURN
```

The same transfer protocol should work regardless of which transport was selected.

---

# 23. Initial Implementation Strategy

The implementation should progress in this order:

```text
Phase 1
Text message

    ↓

Phase 2
Small file

    ↓

Phase 3
Chunked file

    ↓

Phase 4
Chunk verification

    ↓

Phase 5
Backpressure

    ↓

Phase 6
Resume

    ↓

Phase 7
Concurrent chunk transfer
```

Do not implement all of these at once.

The first goal is a reliable sequential chunk transfer.