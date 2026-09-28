import { db } from '../db/storage';
import { meshProtocol } from './MeshProtocol';
import { nativeBridge } from './NativeBridge';
import { MeshPacket } from './types';

export class PeerDiscoveryServiceEngine {
  private timer: any = null;
  private cleanupTimer: any = null;

  constructor() {}

  startAutoDiscoveryBeacon() {
    this.stopAutoDiscoveryBeacon();

    // Broadcast initial beacon immediately on startup
    this.broadcastPresenceBeacon();

    // Broadcast periodic presence beacon every 6 seconds
    this.timer = setInterval(() => {
      this.broadcastPresenceBeacon();
    }, 6000);

    // Run stale peer cleanup every 15 seconds
    this.cleanupTimer = setInterval(() => {
      this.pruneStalePeers();
    }, 15000);
  }

  stopAutoDiscoveryBeacon() {
    if (this.timer) clearInterval(this.timer);
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
  }

  /**
   * Broadcast presence beacon to all nearby MESH users
   */
  async broadcastPresenceBeacon() {
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
        bio: 'Active MESH Peer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        deviceType: 'Mobile',
      }),
      timestamp: Date.now(),
      sequenceNumber: Math.floor(Math.random() * 10000),
      signature: `sig_beacon_${settings.nodeId}`,
    };

    // Send packet via native bridge
    await nativeBridge.sendPacket(beaconPacket);
  }

  /**
   * Prune peers who haven't pinged in 60+ seconds
   */
  private pruneStalePeers() {
    const users = db.getUsers();
    const now = Date.now();
    let updated = false;

    users.forEach((u) => {
      if (now - u.lastSeen > 60000 && u.status !== 'offline') {
        db.saveUser({
          ...u,
          status: 'offline',
        });
        updated = true;
      }
    });

    if (updated) {
      db.addLog({
        level: 'info',
        action: 'PEER_HEARTBEAT_PRUNE',
        details: 'Updated connection statuses for stale off-grid peers',
      });
    }
  }
}

export const peerDiscoveryService = new PeerDiscoveryServiceEngine();
