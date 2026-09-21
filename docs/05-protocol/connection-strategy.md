# Connection Strategy

## Goal

Drop Share should intelligently select the most appropriate connection between two devices.

The system should prefer direct communication whenever possible.

## Connection Priority

The connection strategy is:

1. Direct LAN connection
2. Direct WebRTC P2P connection
3. TURN relay

## Connection Flow

```text
Start Transfer
      |
      v
Detect Connectivity
      |
      v
Same LAN / Direct Local Reachability?
      |
   +--+--+
   |     |
  Yes    No
   |     |
   v     v
 LAN    WebRTC
 P2P      |
           v
      Direct P2P?
       |       |
      Yes      No
       |        |
       v        v
     P2P      TURN
              Relay
```

## Important Principle

The backend should coordinate connection establishment but should not permanently store or process the actual file.

## Transport Abstraction

The transfer engine should not depend directly on a specific connection mechanism.

Conceptually:

```text
Transport
    |
    +-- LAN Transport
    |
    +-- WebRTC Transport
    |
    +-- TURN Relay
```

The transfer engine should communicate with the transport abstraction rather than directly depending on the underlying connection technology.