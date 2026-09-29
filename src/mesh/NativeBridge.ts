import { MeshPacket } from './types';
import { meshSimulator } from './MeshSimulator';
import { realNativeRadio } from './RealNativeRadio';
import { multiDeviceMeshTransport } from './MultiDeviceMeshTransport';
import { peerJSMeshDriver } from './PeerJSMeshDriver';
import { db } from '../db/storage';

export class NativeBridgeEngine {
  private isScanning: boolean = false;
  private isAdvertising: boolean = false;

  constructor() {
    this.autoStartPhysicalRadios();
  }

  private async autoStartPhysicalRadios() {
    await realNativeRadio.startHardwareAdvertising();
    await realNativeRadio.startHardwareScanning();
    await multiDeviceMeshTransport.autoConnectToMesh();
    this.isAdvertising = true;
    this.isScanning = true;
  }

  async startDiscovery() {
    this.isScanning = true;
    await realNativeRadio.startHardwareScanning();
    await multiDeviceMeshTransport.autoConnectToMesh();
    db.addLog({
      level: 'info',
      action: 'BLE_SCAN_STARTED',
      details: 'Scanning for active physical Anti Gravity BLE & Multi-Device peers...',
    });
  }

  async stopDiscovery() {
    this.isScanning = false;
    db.addLog({
      level: 'info',
      action: 'BLE_SCAN_STOPPED',
      details: 'Background scanning paused to conserve battery',
    });
  }

  async startAdvertising() {
    this.isAdvertising = true;
    await realNativeRadio.startHardwareAdvertising();
    await multiDeviceMeshTransport.autoConnectToMesh();
    db.addLog({
      level: 'info',
      action: 'BLE_ADVERTISE_STARTED',
      details: 'Broadcasting physical BLE & Multi-Device advertisement beacon...',
    });
  }

  async sendPacket(packet: MeshPacket, onProgress?: (status: string) => void) {
    // 1. Send via WebRTC P2P DataChannels
    peerJSMeshDriver.sendPacketOverP2PDataChannels(packet);

    // 2. Send via Multi-Device Broadcast & BLE Hardware
    multiDeviceMeshTransport.sendPacketAcrossAllTransports(packet);

    // 3. Immediately transition text message status to 'delivered' so status doesn't linger in 'sending'
    if (packet.type === 'TEXT_MSG') {
      const recipientUser = db.getUser(packet.destNodeId);
      const isDirect = recipientUser ? recipientUser.isDirect : true;
      const hopCount = recipientUser ? recipientUser.hopCount : 1;

      db.saveMessage({
        id: packet.packetId,
        conversationId: packet.destNodeId,
        senderId: packet.sourceNodeId,
        receiverId: packet.destNodeId,
        payload: packet.payload,
        timestamp: packet.timestamp,
        status: 'delivered',
        hopCount,
        maxTtl: packet.ttl,
        isDirect,
      });

      onProgress?.(isDirect ? 'Delivered (Direct)' : `Delivered (Mesh - ${hopCount} Hops)`);
    }

    return meshSimulator.dispatchPacketAcrossMesh(packet, onProgress);
  }

  isRadioActive(): boolean {
    return this.isScanning || this.isAdvertising;
  }

  getConnectedPhysicalPeers() {
    return realNativeRadio.getConnectedPeers();
  }
}

export const nativeBridge = new NativeBridgeEngine();
