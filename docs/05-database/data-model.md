# Drop Share — Data Model

## Core Principle

Drop Share does not permanently store the actual file being transferred.

The database stores metadata required to manage:

- Users
- Rooms
- Participants
- Transfer sessions
- File metadata
- Transfer progress

Actual file data remains on the user's devices.

---

# 1. User

A User represents an authenticated Drop Share user.

```text
User
├── id
├── name
├── email
├── passwordHash
├── createdAt
└── updatedAt
```

### Fields

| Field | Description |
|---|---|
| id | Unique user identifier |
| name | User's display name |
| email | User's email |
| passwordHash | Hashed password |
| createdAt | Account creation time |
| updatedAt | Last update time |

The Auth Service owns the User entity.

---

# 2. Room

A Room represents a temporary file-sharing session.

```text
Room
├── id
├── roomCode
├── status
├── createdBy
├── createdAt
├── expiresAt
└── updatedAt
```

### Fields

| Field | Description |
|---|---|
| id | Internal unique room identifier |
| roomCode | Human-readable room ID |
| status | Current room lifecycle state |
| createdBy | User who created the room |
| createdAt | Room creation time |
| expiresAt | Room expiration time |
| updatedAt | Last state update |

The Room Service owns the Room entity.

---

# 3. Participant

A Participant represents a device/user participating in a room.

```text
Participant
├── id
├── roomId
├── userId
├── role
├── deviceId
├── connectionStatus
├── joinedAt
└── disconnectedAt
```

### Fields

| Field | Description |
|---|---|
| id | Unique participant identifier |
| roomId | Associated room |
| userId | Associated user |
| role | SENDER or RECEIVER |
| deviceId | Identifier for the participating device/session |
| connectionStatus | Current connection state |
| joinedAt | Time participant joined |
| disconnectedAt | Time participant disconnected |

A room initially supports:

```text
1 Sender
1 Receiver
```

Multi-user rooms may be considered later.

---

# 4. Transfer Session

A Transfer Session represents one file transfer attempt.

```text
TransferSession
├── id
├── roomId
├── senderId
├── receiverId
├── status
├── startedAt
├── completedAt
└── updatedAt
```

### Fields

| Field | Description |
|---|---|
| id | Unique transfer identifier |
| roomId | Associated room |
| senderId | Sender participant |
| receiverId | Receiver participant |
| status | Current transfer state |
| startedAt | Transfer start time |
| completedAt | Transfer completion time |
| updatedAt | Last update |

A room may eventually contain multiple transfer sessions.

Example:

```text
Room
 |
 +-- Transfer Session 1
 |
 +-- Transfer Session 2
 |
 +-- Transfer Session 3
```

---

# 5. File Metadata

A Transfer Session can contain information about the file being transferred.

```text
FileMetadata
├── id
├── transferId
├── fileName
├── fileSize
├── mimeType
├── chunkSize
├── totalChunks
├── checksum
└── createdAt
```

### Fields

| Field | Description |
|---|---|
| id | Unique file metadata identifier |
| transferId | Associated transfer |
| fileName | Original file name |
| fileSize | File size in bytes |
| mimeType | File MIME type |
| chunkSize | Size of each transfer chunk |
| totalChunks | Number of chunks |
| checksum | Final file integrity checksum |
| createdAt | Metadata creation time |

Only metadata is stored.

The actual file is not stored in the database.

---

# 6. Transfer Progress

Transfer progress represents the current progress of a transfer.

```text
TransferProgress
├── transferId
├── transferredBytes
├── completedChunks
├── totalChunks
├── percentage
├── averageSpeed
└── updatedAt
```

### Fields

| Field | Description |
|---|---|
| transferId | Associated transfer |
| transferredBytes | Bytes successfully transferred |
| completedChunks | Number of completed chunks |
| totalChunks | Total number of chunks |
| percentage | Transfer percentage |
| averageSpeed | Average transfer speed |
| updatedAt | Last progress update |

This information may not need permanent database storage.

The final implementation can keep real-time progress in memory or Redis and persist only important transfer state.

---

# Entity Relationships

```text
User
 |
 | creates
 ↓
Room
 |
 | contains
 ↓
Participant
 |
 | participates in
 ↓
TransferSession
 |
 | contains metadata for
 ↓
FileMetadata
```

Transfer progress belongs to:

```text
TransferSession
        |
        ↓
TransferProgress
```

---

# Service Ownership

Each service owns its own data.

```text
Auth Service
    |
    └── User


Room Service
    |
    ├── Room
    └── Participant


Transfer / Session Management
    |
    ├── TransferSession
    └── FileMetadata


Runtime / Transfer State
    |
    └── TransferProgress
```

The actual file is owned by:

```text
Sender Device
       |
       ↓
Receiver Device
```

There is no permanent server-side file storage.

---

# Important Design Rule

A service must not directly access another service's database.

For example:

```text
Room Service
     X
     |
     X
Auth Database
```

Instead:

```text
Room Service
     |
     | API / Message
     ↓
Auth Service
```

This keeps service ownership clear and allows services to evolve independently.

---

# Future Considerations

The following may be added later if required:

- Device entity
- Transfer history
- Multiple receivers
- File expiration metadata
- Connection/transport metadata
- Chunk-level tracking
- Transfer analytics

These should not be added to the MVP unless there is a clear requirement.