# Drop Share — User Flow

## 1. Sender Creates a Room

The sender opens Drop Share and selects:

```text
Create Room
```

The backend creates a temporary room and generates a unique Room ID.

Example:

```text
DS-7K92X
```

The sender sees:

```text
Room ID: DS-7K92X
Waiting for receiver...
```

---

## 2. Receiver Joins the Room

The receiver opens Drop Share and enters:

```text
DS-7K92X
```

The receiver selects:

```text
Join Room
```

The Room Service verifies that the room exists and is active.

The sender is notified:

```text
Receiver connected
```

---

## 3. Peer Discovery

The two devices are now associated with the same room.

The Signaling Service establishes communication between the peers.

```text
Sender
   |
   | WebSocket
   |
Signaling Service
   |
   | WebSocket
   |
Receiver
```

The server is only coordinating the connection.

The file is not transferred through the Signaling Service.

---

## 4. Connection Selection

Drop Share determines the best available connection.

The preferred order is:

```text
Direct LAN
    ↓
Direct WebRTC P2P
    ↓
TURN Relay
```

### Case 1 — LAN

If the devices can communicate directly over the local network:

```text
Sender ═════════ Receiver
          LAN P2P
```

Use the direct LAN connection.

### Case 2 — Internet P2P

If direct LAN communication is not available, Drop Share attempts to establish a direct WebRTC connection:

```text
Sender ═════════ Receiver
        WebRTC P2P
```

### Case 3 — TURN

If a direct WebRTC connection cannot be established:

```text
Sender ─── TURN ─── Receiver
```

The TURN server relays the traffic temporarily.

---

## 5. Connection Established

Once a transport is successfully established, the sender and receiver are ready for file transfer.

Example:

```text
Connection established

Transport: WebRTC P2P
```

The actual transport may be:

- LAN
- WebRTC P2P
- TURN Relay

---

## 6. Sender Selects a File

The sender selects a file.

Example:

```text
ubuntu.iso

Size: 4.2 GB
```

The client reads the file metadata.

The entire file should not be loaded into memory.

---

## 7. Transfer Initialization

The sender sends file metadata to the receiver.

Example:

```text
File Name: ubuntu.iso
File Size: 4.2 GB
Chunk Size: 10 MB
Total Chunks: 430
```

The receiver accepts the transfer.

---

## 8. File Chunking

The sender divides the file into smaller chunks.

```text
4.2 GB File

Chunk 0
Chunk 1
Chunk 2
Chunk 3
...
Chunk 429
```

Chunks are transferred incrementally.

---

## 9. Chunk Transfer

The sender transfers chunks through the established transport.

```text
Sender
   |
   +---- Chunk 0 ---->
   |
   +---- Chunk 1 ---->
   |
   +---- Chunk 2 ---->
   |
   +---- Chunk 3 ---->
   |
   ...
   |
   +---- Chunk 429 --->
   |
Receiver
```

The receiver tracks successfully received chunks.

---

## 10. Transfer Progress

Both devices should display transfer information.

Example:

```text
Transfer Progress

██████████████░░░░░░ 72%

Transferred: 3.02 GB / 4.2 GB
Speed: 18.4 MB/s
Remaining: 1.18 GB
```

---

## 11. Transfer Interruption

If the connection is interrupted:

```text
Transfer interrupted

Transferred:
3.02 GB / 4.2 GB
```

The receiver keeps track of successfully received chunks.

The transfer should not automatically restart from the beginning.

---

## 12. Transfer Resume

When the connection is restored, the receiver communicates which chunks it already has.

Example:

```text
Received:

Chunk 0 ✓
Chunk 1 ✓
Chunk 2 ✓
...
Chunk 301 ✓

Missing:

Chunk 302
Chunk 303
...
```

The sender continues from the missing chunks.

---

## 13. Integrity Verification

Transferred chunks should be verified to detect corrupted data.

Conceptually:

```text
Sender
   |
   | Chunk + Checksum
   ↓
Receiver
   |
   | Calculate checksum
   ↓
Compare
```

If the checksum matches:

```text
Chunk valid ✓
```

If it does not:

```text
Chunk invalid ✗
```

The invalid chunk can be transferred again.

---

## 14. File Reconstruction

After all chunks have been received and verified:

```text
Chunk 0
   +
Chunk 1
   +
Chunk 2
   +
...
Chunk 429
   ↓
Original File
```

The receiver saves the reconstructed file locally.

---

## 15. Transfer Completion

After successful reconstruction:

```text
Transfer completed ✓
```

The room can then be marked as:

```text
COMPLETED
```

The temporary room and related session data can eventually expire and be removed.

---

# Complete Flow

```text
Create Room
     |
     v
Generate Room ID
     |
     v
Receiver Joins
     |
     v
Peer Discovery
     |
     v
Connection Selection
     |
     +------ LAN ------+
     |                 |
     +-- WebRTC P2P ---+
     |                 |
     +--- TURN --------+
             |
             v
    Connection Established
             |
             v
       Select File
             |
             v
     Send File Metadata
             |
             v
       Split Into Chunks
             |
             v
       Transfer Chunks
             |
             v
      Verify Chunks
             |
             v
      Transfer Complete?
          /       \
        No         Yes
        |           |
        v           v
      Resume     Reconstruct
                    |
                    v
              File Completed
```

# Core Principle

The server coordinates the session and connection.

The peers transfer the actual file.

```text
Server
  |
  | coordination
  |
  ↓

Sender ═════════════════ Receiver
             File
          Transfer
```