export type PacketType = 
  | 'HANDSHAKE' 
  | 'ROUTE_UPDATE' 
  | 'TEXT_MSG' 
  | 'MSG_ACK' 
  | 'PEER_PING';

export interface MeshPacket {
  packetId: string;
  type: PacketType;
  sourceNodeId: string;
  destNodeId: string;
  senderName: string;
  senderHandle: string;
  ttl: number; // Time To Live (max 5 hops)
  hopCount: number; // Current hop distance
  path: string[]; // Order of relay nodes traversed e.g. ["node_01", "node_02"]
  payload: string;
  timestamp: number;
  sequenceNumber: number;
  signature: string;
}

export interface NodeConnectionState {
  nodeId: string;
  isDirect: boolean;
  rssi: number;
  connectedVia?: string;
  lastPingTime: number;
}
