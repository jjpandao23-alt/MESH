import Peer, { DataConnection } from 'peerjs';
import { db } from '../db/storage';
import { meshProtocol } from './MeshProtocol';
import { MeshPacket } from './types';

export class PeerJSMeshDriverEngine {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private currentRoomCode: string = 'MESH-PUBLIC';
  private isConnected: boolean = false;
  private listeners: Set<() => void> = new Set();
  private beaconInterval: any = null;

  constructor() {
    this.initPeerJS(this.currentRoomCode);
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  /**
   * Initialize PeerJS Engine with custom Mesh Room Code
   */
  initPeerJS(roomCode: string = 'MESH-PUBLIC') {
    this.currentRoomCode = roomCode.toUpperCase().trim();
    const settings = db.getSettings();
    const customPeerId = `ag_${this.currentRoomCode.toLowerCase()}_${settings.nodeId.substring(0, 8)}`;

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (e) {}
    }

    try {
      this.peer = new Peer(customPeerId, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.isConnected = true;
        db.addLog({
          level: 'success',
          action: 'WEBRTC_PEER_READY',
          details: `Connected to WebRTC P2P Mesh Room [${this.currentRoomCode}] as Peer ID [${id}]`,
        });
        this.startPresenceBeacon();
        this.notify();
      });

      // Handle incoming WebRTC P2P connection from another device
      this.peer.on('connection', (conn) => {
        this.handleNewP2PConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS WebRTC Mesh Error:', err);
      });
    } catch (err) {
      console.error('Failed to init PeerJS:', err);
    }
  }

  /**
   * Handle incoming WebRTC DataChannel connection
   */
  private handleNewP2PConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      db.addLog({
        level: 'success',
        action: 'WEBRTC_PEER_CONNECTED',
        details: `Direct WebRTC P2P DataChannel established with peer [${conn.peer}]`,
      });
      this.notify();

      // Send initial presence beacon over new DataChannel
      this.sendPresenceBeaconToConn(conn);
    });

    conn.on('data', (data) => {
      try {
        const packet: MeshPacket = typeof data === 'string' ? JSON.parse(data as string) : (data as any);
        const settings = db.getSettings();
        meshProtocol.handleIncomingPacket(packet, settings.nodeId);
      } catch (e) {
        console.error('Failed to parse WebRTC P2P packet:', e);
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.notify();
    });
  }

  /**
   * Connect directly to a specific target peer ID
   */
  connectToPeer(targetPeerId: string) {
    if (!this.peer || this.connections.has(targetPeerId)) return;
    try {
      const conn = this.peer.connect(targetPeerId, { reliable: true });
      this.handleNewP2PConnection(conn);
    } catch (e) {
      console.warn('Failed to connect to target peer:', e);
    }
  }

  /**
   * Broadcast presence beacon over all active WebRTC P2P DataChannels
   */
  private startPresenceBeacon() {
    if (this.beaconInterval) clearInterval(this.beaconInterval);

    this.beaconInterval = setInterval(() => {
      const settings = db.getSettings();
      const beaconPacket: MeshPacket = {
        packetId: `beacon_${settings.nodeId}_${Date.now()}`,
        type: 'HANDSHAKE',
        sourceNodeId: settings.nodeId,
        destNodeId: 'BROADCAST',
        senderName: settings.nodeName,
        senderHandle: settings.nodeHandle,
        ttl: settings.maxTtl,
        hopCount: 0,
        path: [settings.nodeId],
        payload: JSON.stringify({
          publicKey: settings.publicKey,
          bio: 'Active WebRTC P2P Mesh Peer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          deviceType: 'WebRTC_P2P',
        }),
        timestamp: Date.now(),
        sequenceNumber: Math.floor(Math.random() * 10000),
        signature: `sig_webrtc_${settings.nodeId}`,
      };

      this.sendPacketOverP2PDataChannels(beaconPacket);
    }, 5000);
  }

  private sendPresenceBeaconToConn(conn: DataConnection) {
    const settings = db.getSettings();
    const beaconPacket: MeshPacket = {
      packetId: `beacon_conn_${settings.nodeId}_${Date.now()}`,
      type: 'HANDSHAKE',
      sourceNodeId: settings.nodeId,
      destNodeId: 'BROADCAST',
      senderName: settings.nodeName,
      senderHandle: settings.nodeHandle,
      ttl: settings.maxTtl,
      hopCount: 0,
      path: [settings.nodeId],
      payload: JSON.stringify({
        publicKey: settings.publicKey,
        bio: 'Active WebRTC P2P Mesh Peer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        deviceType: 'WebRTC_P2P',
      }),
      timestamp: Date.now(),
      sequenceNumber: Math.floor(Math.random() * 10000),
      signature: `sig_webrtc_${settings.nodeId}`,
    };

    try {
      conn.send(JSON.stringify(beaconPacket));
    } catch (e) {}
  }

  /**
   * Send mesh packet across all connected WebRTC P2P DataChannels
   */
  sendPacketOverP2PDataChannels(packet: MeshPacket) {
    const payloadStr = JSON.stringify(packet);
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(payloadStr);
        } catch (e) {
          console.warn('WebRTC data send error:', e);
        }
      }
    });
  }

  getRoomCode(): string {
    return this.currentRoomCode;
  }

  getConnectedPeerCount(): number {
    return this.connections.size;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const peerJSMeshDriver = new PeerJSMeshDriverEngine();
