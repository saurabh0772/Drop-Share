# Drop Share

## Overview

Drop Share is a peer-to-peer large file transfer and sharing platform.

The system allows users to establish a connection between two devices and transfer large files directly between them without permanently uploading the file to a central server.

The backend is responsible for room management, peer discovery, signaling, authentication, and connection coordination.

The actual file transfer should happen directly between the two devices whenever possible.

## Primary Goal

Build a scalable peer-to-peer file transfer platform that can efficiently transfer large files between devices while minimizing server-side data transfer and storage.

## Core Principle

The server should coordinate the connection, not store the user's actual file.

## Target Users

- Users who need to transfer large files between their own devices
- Users who need to share large files with another person
- Developers and teams who need temporary peer-to-peer file sharing

## Initial Scope

- Create a temporary sharing room
- Generate a unique room ID
- Join a room using the room ID
- Establish a peer-to-peer connection
- Transfer large files in chunks
- Show transfer progress and speed
- Support resumable transfers
- Verify transferred data
- Prefer direct LAN connectivity
- Support direct WebRTC connectivity over the internet
- Fall back to TURN relay when direct connectivity is not possible

## Non-Goals

The initial system will not:

- Permanently store user files on the server
- Use object storage for file contents
- Act as a traditional upload-and-download platform
- Require both devices to be on the same network