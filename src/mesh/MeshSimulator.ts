import { MeshPacket } from './types';
import { db } from '../db/storage';
import { meshProtocol } from './MeshProtocol';

export interface SimNode {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  x: number; // visual graph coordinates
  y: number;
  battery: number;
  isRelayActive: boolean;
  isOnline: boolean;
}

export interface SimLink {
  fromNodeId: string;
  toNodeId: string;
  rssi: number; // dBm signal strength (-35 = strong, -85 = weak)
  active: boolean;
}

class MeshSimulatorEngine {
  private activeNodeId: string = 'node_alpha_01';
  private nodes: Map<string, SimNode> = new Map();
  private links: SimLink[] = [];
  private listeners: Set<() => void> = new Set();
  private activePacketsInFlight: MeshPacket[] = [];

  constructor() {
    this.initDefaultTopology();
  }

  private initDefaultTopology() {
    const defaultNodes: SimNode[] = [
      {
        id: 'node_alpha_01',
        name: 'Nova Vance (You)',
        handle: 'nova.mesh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        x: 100,
        y: 160,
        battery: 94,
        isRelayActive: true,
        isOnline: true,
      },
      {
        id: 'node_beta_02',
        name: 'Alex Rivera',
        handle: 'alex_rivera',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        x: 280,
        y: 90,
        battery: 88,
        isRelayActive: true,
        isOnline: true,
      },
      {
        id: 'node_gamma_03',
        name: 'Sophia Chen',
        handle: 'sophia.mesh',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        x: 460,
        y: 160,
        battery: 76,
        isRelayActive: true,
        isOnline: true,
      },
      {
        id: 'node_delta_04',
        name: 'Marcus Vance',
        handle: 'marcus_v',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        x: 640,
        y: 230,
        battery: 62,
        isRelayActive: true,
        isOnline: true,
      },
      {
        id: 'node_epsilon_05',
        name: 'Elena Rostova',
        handle: 'elena_r',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        x: 180,
        y: 300,
        battery: 91,
        isRelayActive: true,
        isOnline: true,
      },
    ];

    defaultNodes.forEach((node) => this.nodes.set(node.id, node));

    this.links = [
      { fromNodeId: 'node_alpha_01', toNodeId: 'node_beta_02', rssi: -54, active: true },
      { fromNodeId: 'node_alpha_01', toNodeId: 'node_epsilon_05', rssi: -48, active: true },
      { fromNodeId: 'node_beta_02', toNodeId: 'node_gamma_03', rssi: -68, active: true },
      { fromNodeId: 'node_gamma_03', toNodeId: 'node_delta_04', rssi: -79, active: true },
      { fromNodeId: 'node_epsilon_05', toNodeId: 'node_beta_02', rssi: -62, active: true },
    ];
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  getActiveNodeId(): string {
    return this.activeNodeId;
  }

  setActiveNodeId(id: string) {
    this.activeNodeId = id;
    this.notify();
  }

  getNodes(): SimNode[] {
    return Array.from(this.nodes.values());
  }

  getLinks(): SimLink[] {
    return this.links;
  }

  getPacketsInFlight(): MeshPacket[] {
    return this.activePacketsInFlight;
  }

  toggleLink(fromNodeId: string, toNodeId: string) {
    const linkIndex = this.links.findIndex(
      (l) =>
        (l.fromNodeId === fromNodeId && l.toNodeId === toNodeId) ||
        (l.fromNodeId === toNodeId && l.toNodeId === fromNodeId)
    );
    if (linkIndex >= 0) {
      this.links[linkIndex].active = !this.links[linkIndex].active;
      db.addLog({
        level: this.links[linkIndex].active ? 'info' : 'warn',
        action: this.links[linkIndex].active ? 'LINK_CONNECTED' : 'LINK_DISCONNECTED',
        details: `Mesh physical link between ${fromNodeId} ⟷ ${toNodeId} set to ${
          this.links[linkIndex].active ? 'ACTIVE' : 'DISCONNECTED'
        }`,
      });
      this.notify();
    }
  }

  /**
   * Broadcast a packet across simulated radio waves (BLE / Wi-Fi Direct) with multi-stage hop animation
   */
  async dispatchPacketAcrossMesh(packet: MeshPacket, onProgress?: (status: string) => void) {
    this.activePacketsInFlight.push(packet);
    this.notify();

    db.addLog({
      level: 'info',
      action: 'RADIO_TRANSMIT_START',
      details: `Node ${packet.sourceNodeId} transmitting BLE advertisement packet target ➔ ${packet.destNodeId}`,
      packetId: packet.packetId,
      nodeSource: packet.sourceNodeId,
      nodeDest: packet.destNodeId,
    });

    // Save initial status 'sending'
    db.saveMessage({
      id: packet.packetId,
      conversationId: packet.destNodeId,
      senderId: packet.sourceNodeId,
      receiverId: packet.destNodeId,
      payload: packet.payload,
      timestamp: packet.timestamp,
      status: 'sending',
      hopCount: 0,
      maxTtl: packet.ttl,
      isDirect: false,
    });

    // Determine path through simulator topology
    const neighborsOfSource = this.getNeighbors(packet.sourceNodeId);
    const isDirectNeighbor = neighborsOfSource.includes(packet.destNodeId);

    if (isDirectNeighbor) {
      // 1 Hop direct connection delay
      await new Promise((res) => setTimeout(res, 600));
      onProgress?.('Hopping (1/1)...');

      meshProtocol.handleIncomingPacket(
        {
          ...packet,
          hopCount: 1,
          path: [packet.sourceNodeId, packet.destNodeId],
        },
        packet.destNodeId
      );

      db.updateMessageStatus(packet.packetId, 'delivered', {
        hopCount: 1,
        isDirect: true,
      });
    } else {
      // Multi-hop relay path simulation (e.g. Node A -> Node B -> Node C)
      await new Promise((res) => setTimeout(res, 500));
      db.updateMessageStatus(packet.packetId, 'hopping', { hopCount: 1 });
      onProgress?.('Hopping (1/2)...');

      // Intermediary Relay step (Node B)
      const intermediateNodeId = 'node_beta_02';
      const relayResult = meshProtocol.handleIncomingPacket(packet, intermediateNodeId);

      if (relayResult.action === 'RELAYED') {
        await new Promise((res) => setTimeout(res, 800));
        onProgress?.('Hopping (2/2)...');

        // Final Destination step (Node C)
        meshProtocol.handleIncomingPacket(relayResult.packet, packet.destNodeId);

        db.updateMessageStatus(packet.packetId, 'delivered', {
          hopCount: relayResult.packet.hopCount,
          viaNodeId: intermediateNodeId,
          isDirect: false,
        });
      }
    }

    this.activePacketsInFlight = this.activePacketsInFlight.filter((p) => p.packetId !== packet.packetId);
    this.notify();
  }

  private getNeighbors(nodeId: string): string[] {
    const result: string[] = [];
    this.links.forEach((l) => {
      if (l.active) {
        if (l.fromNodeId === nodeId) result.push(l.toNodeId);
        if (l.toNodeId === nodeId) result.push(l.fromNodeId);
      }
    });
    return result;
  }
}

export const meshSimulator = new MeshSimulatorEngine();
