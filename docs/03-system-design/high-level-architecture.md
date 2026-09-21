# High Level Architecture

## Initial Architecture

```text
                Drop Share Client
                       |
                       |
                 API / WebSocket
                       |
                       v
                Drop Share Backend
                       |
             +---------+---------+
             |                   |
             v                   v
        Room Management      Signaling
                                |
                                |
                    WebRTC Connection Setup
                                |
                                v

                 Sender <=======> Receiver
                         P2P
```

## Core Components

### Client

Responsible for:

- User interface
- Room interaction
- Connection establishment
- File reading
- File chunking
- File transfer
- Transfer progress
- File reconstruction

### Backend

Responsible for:

- Authentication
- Room management
- Peer discovery
- WebRTC signaling
- Connection coordination

### TURN Infrastructure

Responsible for relaying WebRTC traffic when direct peer-to-peer connectivity cannot be established.

## Important Constraint

The backend should not permanently store the actual file being transferred.