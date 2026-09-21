# Functional Requirements

## 1. Room Management

### FR-01 — Create Room

A sender can create a temporary sharing room.

The system generates a unique room ID.

### FR-02 — Join Room

A receiver can join an existing room by entering the room ID.

### FR-03 — Room Expiration

A room should automatically expire after a defined period.

### FR-04 — Room Status

The system should maintain the current state of a room.

Possible states:

- WAITING
- PEER_CONNECTED
- TRANSFERRING
- COMPLETED
- EXPIRED
- FAILED

---

## 2. Peer Connection

### FR-05 — Connection Establishment

The system should establish a connection between the sender and receiver.

### FR-06 — LAN Connection

When both devices are reachable through the same local network, the system should prefer direct local communication.

### FR-07 — Internet P2P

When the devices are on different networks, the system should attempt to establish a direct WebRTC connection.

### FR-08 — TURN Fallback

If a direct WebRTC connection cannot be established, the system should use a TURN relay.

---

## 3. File Transfer

### FR-09 — File Selection

The sender can select a file for transfer.

### FR-10 — Large File Support

The system should support large files without loading the entire file into memory.

### FR-11 — Chunking

Large files should be divided into smaller chunks before transmission.

### FR-12 — Progress

Both sender and receiver should be able to see transfer progress.

### FR-13 — Transfer Speed

The application should display the current and/or average transfer speed.

### FR-14 — Integrity

The receiver should be able to verify that transferred data is not corrupted.

### FR-15 — Resume

A transfer interrupted by a temporary connection failure should be resumable.

---

## 4. Security

### FR-16 — Room Access

Only users connected to the correct room should be able to participate in the transfer.

### FR-17 — Temporary Access

Room access should expire when the room expires.

### FR-18 — Secure Connection

File data should be transferred through a secure connection.