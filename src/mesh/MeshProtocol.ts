import { MeshPacket } from './types';
import { db } from '../db/storage';
import { Message, User } from '../db/schema';

export class MeshProtocol {
  private seenPacketIds: Set<string> = new Set();
  private sequenceCounter: number = 100;

  constructor() {}

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

    this.seenPacketIds.add(packetId);
    return { packet, messageRecord };
  }

  handleIncomingPacket(packet: MeshPacket, currentNodeId: string): { action: 'ACCEPTED' | 'RELAYED' | 'DROPPED'; packet: MeshPacket } {
    const settings = db.getSettings();

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

    // 3. Auto Register/Update Peer Discovery ONLY for external nodes (NEVER self)
    if (packet.sourceNodeId && packet.sourceNodeId !== settings.nodeId && packet.sourceNodeId !== currentNodeId) {
      let extraData: any = {};
      try {
        if (packet.type === 'HANDSHAKE' && packet.payload) {
          extraData = JSON.parse(packet.payload);
        }
      } catch (e) {}

      const existingUser = db.getUser(packet.sourceNodeId);
      const calculatedHops = Math.max(1, packet.hopCount);

      if (existingUser) {
        db.saveUser({
          ...existingUser,
          hopCount: calculatedHops,
          isDirect: calculatedHops === 1,
          status: calculatedHops === 1 ? 'online' : 'mesh',
          lastSeen: Date.now(),
        });
      } else {
        db.saveUser({
          id: packet.sourceNodeId,
          name: packet.senderName || `MESH Peer (${packet.sourceNodeId.substring(0, 4)})`,
          handle: packet.senderHandle || `peer_${packet.sourceNodeId.substring(0, 4)}`,
          avatar: extraData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
          publicKey: extraData.publicKey || `pub_pk_${packet.sourceNodeId.substring(0, 6)}`,
          isDirect: calculatedHops === 1,
          hopCount: calculatedHops,
          status: calculatedHops === 1 ? 'online' : 'mesh',
          lastSeen: Date.now(),
          bio: extraData.bio || 'Discovered MESH peer',
        });

        db.addLog({
          level: 'success',
          action: 'NEW_MESH_PEER_DISCOVERED',
          details: `Connected to MESH user [${packet.senderName}] (${calculatedHops} Hops)`,
          nodeSource: packet.sourceNodeId,
        });
      }
    }

    // 4. Handle Text Message Delivery (ONLY for TEXT_MSG type)
    const isTargetForMe = packet.destNodeId === currentNodeId || packet.destNodeId === 'BROADCAST';

    if (isTargetForMe) {
      db.addLog({
        level: 'success',
        action: 'PACKET_DELIVERED',
        details: `Packet ${packet.packetId.substring(0, 8)} (${packet.type}) received from [${packet.senderName}]`,
        packetId: packet.packetId,
        nodeSource: packet.sourceNodeId,
        nodeDest: currentNodeId,
      });

      // ONLY save to chat history if it is a TEXT_MSG (NEVER save HANDSHAKE JSON payloads as chat messages!)
      if (packet.type === 'TEXT_MSG' && packet.sourceNodeId !== settings.nodeId) {
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
      }

      if (packet.destNodeId !== 'BROADCAST') {
        return { action: 'ACCEPTED', packet };
      }
    }

    // 5. TTL Check
    if (packet.ttl <= 1) {
      db.addLog({
        level: 'warn',
        action: 'TTL_EXPIRED',
        details: `Packet ${packet.packetId.substring(0, 8)} discarded: TTL reached 0`,
        packetId: packet.packetId,
      });
      return { action: 'DROPPED', packet };
    }

    // 6. Silent Relay Forwarding
    const relayedPacket: MeshPacket = {
      ...packet,
      ttl: packet.ttl - 1,
      hopCount: packet.hopCount + 1,
      path: [...packet.path, currentNodeId],
    };

    db.addLog({
      level: 'mesh',
      action: 'SILENT_RELAY_FORWARD',
      details: `Node ${currentNodeId} silently relayed packet from ${packet.sourceNodeId} ➔ ${packet.destNodeId}`,
      packetId: packet.packetId,
      nodeSource: packet.sourceNodeId,
      nodeDest: packet.destNodeId,
    });

    return { action: 'RELAYED', packet: relayedPacket };
  }
}

export const meshProtocol = new MeshProtocol();
