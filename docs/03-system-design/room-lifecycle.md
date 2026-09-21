# Drop Share — Room Lifecycle

## Purpose

A room represents a temporary file-sharing session between a sender and a receiver.

A room has a lifecycle that starts when the sender creates it and ends when the transfer is completed, cancelled, or the room expires.

---

## Room States

The initial room states are:

```text
WAITING
PEER_CONNECTED
CONNECTING
READY
TRANSFERRING
PAUSED
COMPLETED
FAILED
EXPIRED
CANCELLED
```

---

## 1. WAITING

The sender has created the room.

No receiver has joined yet.

```text
Sender
  |
  v
Room Created
  |
  v
WAITING
```

Example:

```text
Room ID: DS-7K92X

Waiting for receiver...
```

---

## 2. PEER_CONNECTED

A receiver has successfully joined the room.

```text
WAITING
   |
   | Receiver joins
   v
PEER_CONNECTED
```

At this stage, the two users are associated with the same room.

The actual P2P connection has not necessarily been established yet.

---

## 3. CONNECTING

The system is attempting to establish the best available transport.

```text
PEER_CONNECTED
       |
       v
CONNECTING
```

The connection strategy attempts:

```text
LAN
 ↓
Direct WebRTC P2P
 ↓
TURN Relay
```

---

## 4. READY

A usable transport connection has been established.

```text
CONNECTING
     |
     | Connection established
     v
   READY
```

Example:

```text
Connected ✓

Transport: WebRTC P2P

Ready to transfer
```

---

## 5. TRANSFERRING

The sender has started transferring a file.

```text
READY
  |
  | Start transfer
  v
TRANSFERRING
```

The system tracks:

- File name
- File size
- Total chunks
- Transferred chunks
- Transfer speed
- Progress

---

## 6. PAUSED

The transfer has temporarily stopped but the session is still recoverable.

Possible reasons:

- Temporary network interruption
- User pauses transfer
- Backpressure
- Connection recovery

```text
TRANSFERRING
      |
      v
   PAUSED
      |
      | Resume
      v
TRANSFERRING
```

---

## 7. COMPLETED

All chunks have been successfully transferred and verified.

```text
TRANSFERRING
      |
      | All chunks verified
      v
COMPLETED
```

The file has been successfully reconstructed on the receiver's device.

---

## 8. FAILED

The transfer or connection failed and cannot currently continue.

```text
CONNECTING
    |
    v
  FAILED
```

or:

```text
TRANSFERRING
      |
      v
    FAILED
```

A failed session may potentially be restarted depending on the reason for failure.

---

## 9. EXPIRED

The room has exceeded its allowed lifetime.

Example:

```text
WAITING
   |
   | Room timeout
   v
EXPIRED
```

An expired room cannot accept new participants.

---

## 10. CANCELLED

The sender or receiver intentionally ends the session.

```text
WAITING / READY / TRANSFERRING
              |
              | User cancels
              v
          CANCELLED
```

---

# State Transition Diagram

```text
                         +----------------+
                         |    WAITING     |
                         +-------+--------+
                                 |
                                 | Receiver joins
                                 v
                         +----------------+
                         | PEER_CONNECTED |
                         +-------+--------+
                                 |
                                 | Start connection
                                 v
                         +----------------+
                         |   CONNECTING   |
                         +-------+--------+
                                 |
                        Connection success
                                 |
                                 v
                         +----------------+
                         |      READY     |
                         +-------+--------+
                                 |
                                 | Start transfer
                                 v
                       +--------------------+
                       |    TRANSFERRING    |
                       +---------+----------+
                                 |
                     +-----------+-----------+
                     |                       |
              Temporary issue          Transfer complete
                     |                       |
                     v                       v
              +-------------+         +-------------+
              |    PAUSED   |         |  COMPLETED  |
              +------+------+         +-------------+
                     |
                     | Resume
                     v
              TRANSFERRING


Any active state may also transition to:

        FAILED
          |
          v
      Session ended

        EXPIRED
          |
          v
      Session ended

       CANCELLED
          |
          v
      Session ended
```

---

# Terminal States

The following states are terminal:

```text
COMPLETED
FAILED
EXPIRED
CANCELLED
```

Once a room reaches one of these states, it should not return to an active state.

---

# Important Distinction

Room state and connection state are not exactly the same thing.

For example:

```text
Room:
TRANSFERRING

Connection:
CONNECTED
```

or:

```text
Room:
PAUSED

Connection:
DISCONNECTED
```

Therefore, the final implementation should not try to represent every possible connection condition using only the room state.

The Room Service manages the room lifecycle.

The connection layer manages connection state.

The Transfer Engine manages transfer state.