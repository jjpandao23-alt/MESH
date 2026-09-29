import { MeshPacket } from './types';
import { meshSimulator } from './MeshSimulator';
import { realNativeRadio } from './RealNativeRadio';
import { multiDeviceMeshTransport } from './MultiDeviceMeshTransport';
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
    // 1. Transmit packet over Multi-Device Transport Engine (BLE + WebRTC + BroadcastChannel)
    multiDeviceMeshTransport.sendPacketAcrossAllTransports(packet);

    // 2. Dispatch through local simulator for instant state feedback
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
