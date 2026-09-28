import { MeshPacket } from './types';
import { meshSimulator } from './MeshSimulator';
import { realNativeRadio } from './RealNativeRadio';
import { db } from '../db/storage';

export class NativeBridgeEngine {
  private isScanning: boolean = false;
  private isAdvertising: boolean = false;
  private isPhysicalHardwareMode: boolean = true; // Set default to physical device radio hardware

  constructor() {
    this.autoStartPhysicalRadios();
  }

  private async autoStartPhysicalRadios() {
    await realNativeRadio.startHardwareAdvertising();
    await realNativeRadio.startHardwareScanning();
    this.isAdvertising = true;
    this.isScanning = true;
  }

  async startDiscovery() {
    this.isScanning = true;
    await realNativeRadio.startHardwareScanning();
    db.addLog({
      level: 'info',
      action: 'BLE_SCAN_STARTED',
      details: 'Scanning for active physical Anti Gravity BLE devices (Service: 0xFE99)...',
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
    db.addLog({
      level: 'info',
      action: 'BLE_ADVERTISE_STARTED',
      details: 'Broadcasting physical BLE advertisement beacon...',
    });
  }

  async sendPacket(packet: MeshPacket, onProgress?: (status: string) => void) {
    // 1. Transmit packet over physical BLE radio antenna to real surrounding devices
    await realNativeRadio.sendPacketOverHardwareRadio(packet);

    // 2. Transmit through local mesh engine for instant reactive state & simulation backup
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
