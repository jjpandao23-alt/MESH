import { User, Message, MeshRoute, NetworkLog, AppSettings } from './schema';

const STORAGE_KEYS = {
  USERS: 'anti_gravity_users_v2',
  MESSAGES: 'anti_gravity_messages_v2',
  ROUTES: 'anti_gravity_routes_v2',
  LOGS: 'anti_gravity_logs_v2',
  SETTINGS: 'anti_gravity_settings_v2',
};

// Local Node Config (Generates random unique Node ID per physical device)
const getRandomNodeId = () => {
  const hex = Math.random().toString(16).substring(2, 8);
  return `node_mesh_${hex}`;
};

const DEFAULT_MY_NODE: AppSettings = {
  nodeId: getRandomNodeId(),
  nodeName: 'MESH User',
  nodeHandle: 'mesh_user',
  publicKey: `pub_pk_${Math.random().toString(36).substring(2, 12)}`,
  bleEnabled: true,
  wifiDirectEnabled: true,
  relayModeEnabled: true,
  maxTtl: 5,
  darkMode: true,
};

const INITIAL_USERS: User[] = [];
const INITIAL_MESSAGES: Message[] = [];
const INITIAL_ROUTES: MeshRoute[] = [];
const INITIAL_LOGS: NetworkLog[] = [
  {
    id: `log_init_${Date.now()}`,
    timestamp: Date.now(),
    level: 'info',
    action: 'MESH_ENGINE_STARTED',
    details: 'Off-grid P2P mesh network engine initialized with clean state',
  }
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
    if (logs.length > 100) logs.pop();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    this.notify();
  }

  resetAllData() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_MY_NODE));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    this.notify();
  }
}

export const db = new StorageEngine();
