# Non-Functional Requirements

## Performance

The system should utilize the maximum practical throughput available between the two peers.

The application should avoid unnecessary server-side data transfer.

## Scalability

Signaling, room management, and authentication services should be horizontally scalable.

The architecture should support multiple instances of each service.

## Reliability

Temporary network interruptions should not require the entire file transfer to restart.

## Memory Efficiency

The application should not load an entire large file into memory.

Files should be processed incrementally.

## Availability

The signaling infrastructure should continue working when individual service instances fail.

## Security

Communication between clients and backend services should use secure protocols.

File access should be restricted to authorized participants of the sharing session.

## Observability

The system should eventually provide:

- Request metrics
- Transfer metrics
- Connection metrics
- Error logs
- Service health information