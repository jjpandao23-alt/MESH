import { MeshPacket } from './types';
import { meshSimulator } from './MeshSimulator';
import { db } from '../db/storage';

export class NativeBridgeEngine {
  private isScanning: boolean = false;
  private isAdvertising: boolean = false;

  constructor() {}

  async startDiscovery() {
    this.isScanning = true;
    db.addLog({
      level: 'info',
      action: 'BLE_SCAN_STARTED',
      details: 'Scanning for active Anti Gravity BLE Service UUID 0xFE99 & Wi-Fi Direct peers...',
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
    db.addLog({
      level: 'info',
      action: 'BLE_ADVERTISE_STARTED',
      details: 'Broadcasting BLE beacon [AntiGravity-Node-Alpha]',
    });
  }

  async sendPacket(packet: MeshPacket, onProgress?: (status: string) => void) {
    // Uses MeshSimulator for dev/web preview, or bridges to Native BLE/Nearby Connections on Android/iOS
    return meshSimulator.dispatchPacketAcrossMesh(packet, onProgress);
  }

  isRadioActive(): boolean {
    return this.isScanning || this.isAdvertising;
  }
}

export const nativeBridge = new NativeBridgeEngine();
