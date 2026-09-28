declare module 'react-native-ble-plx' {
  export class BleManager {
    constructor();
    startDeviceScan(
      UUIDs: string[] | null,
      options: any,
      listener: (error: any, device: any) => void
    ): void;
    stopDeviceScan(): void;
    writeCharacteristicWithResponseForDevice(
      deviceIdentifier: string,
      serviceUUID: string,
      characteristicUUID: string,
      base64Value: string
    ): Promise<any>;
    destroy(): void;
  }
}
