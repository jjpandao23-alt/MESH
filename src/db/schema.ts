export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  publicKey: string;
  isDirect: boolean;
  hopCount: number; // 1 = Direct, 2+ = Mesh Node
  status: 'online' | 'mesh' | 'offline';
  rssi?: number; // Signal strength in dBm (-30 to -90)
  lastSeen: number;
  deviceType?: 'Android' | 'iOS' | 'MeshRelay';
  bio?: string;
}

export type DeliveryStatus = 'sending' | 'hopping' | 'delivered' | 'failed';

export interface Message {
  id: string;
  conversationId: string; // Peer ID or Group ID
  senderId: string;
  receiverId: string;
  payload: string;
  timestamp: number;
  status: DeliveryStatus;
  hopCount: number;
  maxTtl: number;
  viaNodeId?: string;
  isDirect: boolean;
  replyToId?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'location';
}

export interface MeshRoute {
  id: string;
  targetNodeId: string;
  nextHopNodeId: string;
  costHops: number;
  signalStrength: number;
  lastUpdated: number;
}

export interface NetworkLog {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'success' | 'mesh';
  action: string;
  details: string;
  packetId?: string;
  nodeSource?: string;
  nodeDest?: string;
}

export interface AppSettings {
  nodeId: string;
  nodeName: string;
  nodeHandle: string;
  publicKey: string;
  bleEnabled: boolean;
  wifiDirectEnabled: boolean;
  relayModeEnabled: boolean; // Allow device to act as silent forwarding node
  maxTtl: number;
  darkMode: boolean;
}
