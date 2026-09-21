# System Constraints

## File Storage

Drop Share must not permanently store the actual files being transferred on the backend.

## Peer-to-Peer Transfer

The system should prefer direct peer-to-peer communication whenever technically possible.

## Connection Fallback

The connection strategy should follow:

1. Direct LAN connectivity
2. Direct WebRTC P2P
3. TURN relay

## Large Files

Large files must be transferred incrementally.

The entire file should not need to be loaded into memory.

## Resumability

An interrupted transfer should be able to continue from the last successfully transferred portion rather than restarting from the beginning.

## Security

File data should not be exposed through publicly accessible server storage.

## Scalability

The signaling and room-management infrastructure should support multiple instances.

## Service Independence

Each microservice should own its own responsibility and data.

Services should communicate through well-defined APIs or messaging mechanisms rather than directly accessing another service's database.