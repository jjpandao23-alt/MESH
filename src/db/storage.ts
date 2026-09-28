import { User, Message, MeshRoute, NetworkLog, AppSettings } from './schema';

const STORAGE_KEYS = {
  USERS: 'anti_gravity_users_v1',
  MESSAGES: 'anti_gravity_messages_v1',
  ROUTES: 'anti_gravity_routes_v1',
  LOGS: 'anti_gravity_logs_v1',
  SETTINGS: 'anti_gravity_settings_v1',
};

// Initial Seed Data mirroring Instagram P2P Mesh
const DEFAULT_MY_NODE: AppSettings = {
  nodeId: 'node_alpha_01',
  nodeName: 'Nova Vance (You)',
  nodeHandle: 'nova.mesh',
  publicKey: 'pub_pk_88a9f41029c011e4',
  bleEnabled: true,
  wifiDirectEnabled: true,
  relayModeEnabled: true,
  maxTtl: 5,
  darkMode: true,
};

const INITIAL_USERS: User[] = [
  {
    id: 'node_beta_02',
    name: 'Alex Rivera',
    handle: 'alex_rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    publicKey: 'pub_pk_44b7e192',
    isDirect: true,
    hopCount: 1,
    status: 'online',
    rssi: -54,
    lastSeen: Date.now() - 1000 * 30,
    deviceType: 'Android',
    bio: 'P2P explorer & off-grid hiker 🏔️',
  },
  {
    id: 'node_gamma_03',
    name: 'Sophia Chen',
    handle: 'sophia.mesh',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    publicKey: 'pub_pk_99c3a221',
    isDirect: false, // Connected via Alex Rivera (2 hops)
    hopCount: 2,
    status: 'mesh',
    rssi: -78,
    lastSeen: Date.now() - 1000 * 60 * 2,
    deviceType: 'iOS',
    bio: 'Distributed systems & privacy advocate 🔒',
  },
  {
    id: 'node_delta_04',
    name: 'Marcus Vance',
    handle: 'marcus_v',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    publicKey: 'pub_pk_77d12f45',
    isDirect: false, // Connected via Sophia -> Alex (3 hops)
    hopCount: 3,
    status: 'mesh',
    rssi: -85,
    lastSeen: Date.now() - 1000 * 60 * 8,
    deviceType: 'Android',
    bio: 'Emergency mesh operator 📡',
  },
  {
    id: 'node_epsilon_05',
    name: 'Elena Rostova',
    handle: 'elena_r',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    publicKey: 'pub_pk_33e99b01',
    isDirect: true,
    hopCount: 1,
    status: 'online',
    rssi: -48,
    lastSeen: Date.now() - 1000 * 15,
    deviceType: 'iOS',
    bio: 'Drone photography & off-grid tech 🛸',
  },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_01',
    conversationId: 'node_beta_02',
    senderId: 'node_beta_02',
    receiverId: 'node_alpha_01',
    payload: 'Hey Nova! Mesh link signal is super crisp today (-54 dBm).',
    timestamp: Date.now() - 1000 * 60 * 12,
    status: 'delivered',
    hopCount: 1,
    maxTtl: 5,
    isDirect: true,
  },
  {
    id: 'msg_02',
    conversationId: 'node_beta_02',
    senderId: 'node_alpha_01',
    receiverId: 'node_beta_02',
    payload: 'Awesome! I can see Sophia is also connected through your relay node.',
    timestamp: Date.now() - 1000 * 60 * 10,
    status: 'delivered',
    hopCount: 1,
    maxTtl: 5,
    isDirect: true,
  },
  {
    id: 'msg_03',
    conversationId: 'node_gamma_03',
    senderId: 'node_gamma_03',
    receiverId: 'node_alpha_01',
    payload: 'Hello from 2 hops away! Alex bridged our BLE packets seamlessly.',
    timestamp: Date.now() - 1000 * 60 * 5,
    status: 'delivered',
    hopCount: 2,
    maxTtl: 5,
    viaNodeId: 'node_beta_02',
    isDirect: false,
  },
  {
    id: 'msg_04',
    conversationId: 'node_gamma_03',
    senderId: 'node_alpha_01',
    receiverId: 'node_gamma_03',
    payload: 'Anti Gravity mesh routing is working! Flooding logic handled the hop.',
    timestamp: Date.now() - 1000 * 60 * 2,
    status: 'delivered',
    hopCount: 2,
    maxTtl: 5,
    viaNodeId: 'node_beta_02',
    isDirect: false,
  }
];

const INITIAL_ROUTES: MeshRoute[] = [
  {
    id: 'route_1',
    targetNodeId: 'node_beta_02',
    nextHopNodeId: 'node_beta_02',
    costHops: 1,
    signalStrength: -54,
    lastUpdated: Date.now(),
  },
  {
    id: 'route_2',
    targetNodeId: 'node_gamma_03',
    nextHopNodeId: 'node_beta_02',
    costHops: 2,
    signalStrength: -78,
    lastUpdated: Date.now(),
  },
  {
    id: 'route_3',
    targetNodeId: 'node_delta_04',
    nextHopNodeId: 'node_gamma_03',
    costHops: 3,
    signalStrength: -85,
    lastUpdated: Date.now(),
  },
  {
    id: 'route_4',
    targetNodeId: 'node_epsilon_05',
    nextHopNodeId: 'node_epsilon_05',
    costHops: 1,
    signalStrength: -48,
    lastUpdated: Date.now(),
  },
];

const INITIAL_LOGS: NetworkLog[] = [
  {
    id: 'log_01',
    timestamp: Date.now() - 1000 * 60 * 15,
    level: 'info',
    action: 'BLE_ADVERTISE_START',
    details: 'Broadcasting Anti Gravity BLE service UUID [0xFE99] on Node Alpha',
  },
  {
    id: 'log_02',
    timestamp: Date.now() - 1000 * 60 * 14,
    level: 'success',
    action: 'PEER_HANDSHAKE_DIRECT',
    details: 'Direct P2P link established with Alex Rivera (node_beta_02) via Wi-Fi Direct',
    nodeSource: 'node_beta_02',
  },
  {
    id: 'log_03',
    timestamp: Date.now() - 1000 * 60 * 8,
    level: 'mesh',
    action: 'MESH_PACKET_RELAY',
    details: 'Discovered multi-hop peer Sophia Chen (node_gamma_03) via route [Alex -> Sophia]',
    nodeSource: 'node_beta_02',
    nodeDest: 'node_gamma_03',
  },
];

type Listener = () => void;

class StorageEngine {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_MY_NODE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROUTES)) {
      localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(INITIAL_ROUTES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Settings
  getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_MY_NODE;
  }

  updateSettings(settings: Partial<AppSettings>) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    this.notify();
  }

  // Users / Peers
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : INITIAL_USERS;
  }

  getUser(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  saveUser(user: User) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  // Messages
  getMessages(conversationId?: string): Message[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    const messages: Message[] = raw ? JSON.parse(raw) : INITIAL_MESSAGES;
    if (conversationId) {
      return messages.filter(
        (m) => m.conversationId === conversationId || m.senderId === conversationId || m.receiverId === conversationId
      );
    }
    return messages;
  }

  saveMessage(msg: Message) {
    const messages = this.getMessages();
    const existingIndex = messages.findIndex((m) => m.id === msg.id);
    if (existingIndex >= 0) {
      messages[existingIndex] = msg;
    } else {
      messages.push(msg);
    }
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    this.notify();
  }

  updateMessageStatus(msgId: string, status: Message['status'], extra?: Partial<Message>) {
    const messages = this.getMessages();
    const index = messages.findIndex((m) => m.id === msgId);
    if (index >= 0) {
      messages[index] = { ...messages[index], status, ...extra };
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      this.notify();
    }
  }

  // Routes
  getRoutes(): MeshRoute[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTES);
    return raw ? JSON.parse(raw) : INITIAL_ROUTES;
  }

  saveRoute(route: MeshRoute) {
    const routes = this.getRoutes();
    const index = routes.findIndex((r) => r.targetNodeId === route.targetNodeId);
    if (index >= 0) {
      routes[index] = route;
    } else {
      routes.push(route);
    }
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
    this.notify();
  }

  // Logs
  getLogs(): NetworkLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : INITIAL_LOGS;
  }

  addLog(log: Omit<NetworkLog, 'id' | 'timestamp'>) {
    const logs = this.getLogs();
    const newLog: NetworkLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    logs.unshift(newLog);
    // Keep max 100 logs
    if (logs.length > 100) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify();
  }

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_MY_NODE));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(INITIAL_ROUTES));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    this.notify();
  }
}

export const db = new StorageEngine();
