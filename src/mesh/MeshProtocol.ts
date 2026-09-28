import { MeshPacket, PacketType } from './types';
import { db } from '../db/storage';
import { Message, User } from '../db/schema';

export class MeshProtocol {
  private seenPacketIds: Set<string> = new Set();
  private sequenceCounter: number = 100;

  constructor() {}

  /**
   * Create a new message packet ready to be sent across the mesh
   */
  createMessagePacket(
    receiverId: string,
    text: string,
    existingMsgId?: string
  ): { packet: MeshPacket; messageRecord: Message } {
    const settings = db.getSettings();
    const packetId = existingMsgId || `pkt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const timestamp = Date.now();
    this.sequenceCounter++;

    const receiverUser = db.getUser(receiverId);
    const isDirect = receiverUser ? receiverUser.isDirect : false;

    const packet: MeshPacket = {
      packetId,
      type: 'TEXT_MSG',
      sourceNodeId: settings.nodeId,
      destNodeId: receiverId,
      senderName: settings.nodeName,
      senderHandle: settings.nodeHandle,
      ttl: settings.maxTtl,
      hopCount: 0,
      path: [settings.nodeId],
      payload: text,
      timestamp,
      sequenceNumber: this.sequenceCounter,
      signature: `sig_${Math.random().toString(36).substring(2, 10)}`,
    };

    const messageRecord: Message = {
      id: packetId,
      conversationId: receiverId,
      senderId: settings.nodeId,
      receiverId,
      payload: text,
      timestamp,
      status: 'sending',
      hopCount: 0,
      maxTtl: settings.maxTtl,
      isDirect,
    };

    // Mark as seen locally
    this.seenPacketIds.add(packetId);

    return { packet, messageRecord };
  }

  /**
   * Ingest and route an incoming packet from BLE or Wi-Fi Direct interface
   */
  handleIncomingPacket(packet: MeshPacket, currentNodeId: string): { action: 'ACCEPTED' | 'RELAYED' | 'DROPPED'; packet: MeshPacket } {
    // 1. Loop Prevention: Drop if already seen
    if (this.seenPacketIds.has(packet.packetId)) {
      return { action: 'DROPPED', packet };
    }
    this.seenPacketIds.add(packet.packetId);

    // 2. Loop Prevention: Drop if local node is already in path
    if (packet.path.includes(currentNodeId)) {
      db.addLog({
        level: 'warn',
        action: 'MESH_LOOP_PREVENTED',
        details: `Dropped redundant packet ${packet.packetId.substring(0, 8)} to prevent cycle`,
        packetId: packet.packetId,
      });
      return { action: 'DROPPED', packet };
    }

    // 3. Destination Reached!
    if (packet.destNodeId === currentNodeId) {
      db.addLog({
        level: 'success',
        action: 'PACKET_DELIVERED',
        details: `Packet ${packet.packetId.substring(0, 8)} reached destination after ${packet.hopCount} hops via [${packet.path.join(' ➔ ')}]`,
        packetId: packet.packetId,
        nodeSource: packet.sourceNodeId,
        nodeDest: currentNodeId,
      });

      // Update message delivery in DB if local message
      if (packet.type === 'TEXT_MSG') {
        const incomingMsg: Message = {
          id: packet.packetId,
          conversationId: packet.sourceNodeId,
          senderId: packet.sourceNodeId,
          receiverId: currentNodeId,
          payload: packet.payload,
          timestamp: packet.timestamp,
          status: 'delivered',
          hopCount: packet.hopCount,
          maxTtl: packet.ttl,
          isDirect: packet.hopCount === 1,
          viaNodeId: packet.path.length > 2 ? packet.path[packet.path.length - 2] : undefined,
        };
        db.saveMessage(incomingMsg);

        // Ensure user exists or update hop distance
        let senderUser = db.getUser(packet.sourceNodeId);
        if (senderUser) {
          db.saveUser({
            ...senderUser,
            hopCount: packet.hopCount,
            isDirect: packet.hopCount === 1,
            status: packet.hopCount === 1 ? 'online' : 'mesh',
            lastSeen: Date.now(),
          });
        } else {
          db.saveUser({
            id: packet.sourceNodeId,
            name: packet.senderName,
            handle: packet.senderHandle,
            avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
            publicKey: `pub_pk_${packet.sourceNodeId.substring(0, 6)}`,
            isDirect: packet.hopCount === 1,
            hopCount: packet.hopCount,
            status: packet.hopCount === 1 ? 'online' : 'mesh',
            lastSeen: Date.now(),
          });
        }
      }

      return { action: 'ACCEPTED', packet };
    }

    // 4. TTL Check
    if (packet.ttl <= 1) {
      db.addLog({
        level: 'warn',
        action: 'TTL_EXPIRED',
        details: `Packet ${packet.packetId.substring(0, 8)} discarded: TTL reached 0 at hop count ${packet.hopCount}`,
        packetId: packet.packetId,
      });
      return { action: 'DROPPED', packet };
    }

    // 5. Silent Relay Forwarding
    const relayedPacket: MeshPacket = {
      ...packet,
      ttl: packet.ttl - 1,
      hopCount: packet.hopCount + 1,
      path: [...packet.path, currentNodeId],
    };

    db.addLog({
      level: 'mesh',
      action: 'SILENT_RELAY_FORWARD',
      details: `Node ${currentNodeId} silently relayed packet from ${packet.sourceNodeId} ➔ ${packet.destNodeId} (TTL: ${relayedPacket.ttl}, Hop: ${relayedPacket.hopCount})`,
      packetId: packet.packetId,
      nodeSource: packet.sourceNodeId,
      nodeDest: packet.destNodeId,
    });

    return { action: 'RELAYED', packet: relayedPacket };
  }
}

export const meshProtocol = new MeshProtocol();
