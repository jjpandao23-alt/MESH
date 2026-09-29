import { db } from '../db/storage';
import { meshProtocol } from './MeshProtocol';
import { MeshPacket } from './types';

export class WebBluetoothRadioEngine {
  private connectedGattServer: any = null;
  private isConnected: boolean = false;

  constructor() {}

  /**
   * Request Bluetooth Permission in Browser via W3C Web Bluetooth API
   * Triggers Chrome / OS Native Bluetooth Device Selector
   */
  async requestWebBluetoothPermission(): Promise<boolean> {
    if (!('bluetooth' in navigator)) {
      alert('Web Bluetooth is not supported in this browser. Please use Chrome, Edge, Opera, or the Native Android/iOS build.');
      return false;
    }

    try {
      db.addLog({
        level: 'info',
        action: 'WEB_BLE_REQUEST',
        details: 'Requesting Web Bluetooth hardware permission from browser...',
      });

      // Triggers native browser Bluetooth selection modal window
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000fe99-0000-1000-8000-00805f9b34fb', 'battery_service'],
      });

      if (device) {
        db.addLog({
          level: 'success',
          action: 'WEB_BLE_PAIRED',
          details: `Bluetooth permission granted for physical device [${device.name || device.id}]`,
        });

        // Connect GATT Server
        if (device.gatt) {
          this.connectedGattServer = await device.gatt.connect();
          this.isConnected = true;
          db.addLog({
            level: 'success',
            action: 'GATT_CONNECTED',
            details: `GATT Hardware channel connected to ${device.name || 'Bluetooth Device'}`,
          });
        }

        return true;
      }
    } catch (err: any) {
      db.addLog({
        level: 'warn',
        action: 'WEB_BLE_CANCELLED',
        details: `Bluetooth permission request: ${err.message || 'User cancelled'}`,
      });
    }

    return false;
  }

  isHardwareConnected(): boolean {
    return this.isConnected;
  }
}

export const webBluetoothRadio = new WebBluetoothRadioEngine();
