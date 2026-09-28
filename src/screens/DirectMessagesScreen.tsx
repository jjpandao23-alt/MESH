import React, { useState, useEffect } from 'react';
import { Search, Radio, Wifi, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import { db } from '../db/storage';
import { User, Message } from '../db/schema';

interface DirectMessagesScreenProps {
  onSelectPeer: (peer: User) => void;
}

export const DirectMessagesScreen: React.FC<DirectMessagesScreenProps> = ({ onSelectPeer }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [messages, setMessages] = useState<Message[]>(db.getMessages());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setUsers(db.getUsers());
      setMessages(db.getMessages());
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastMessage = (peerId: string) => {
    const peerMsgs = messages.filter((m) => m.conversationId === peerId || m.senderId === peerId || m.receiverId === peerId);
    if (peerMsgs.length === 0) return null;
    return peerMsgs[peerMsgs.length - 1];
  };

  const formatTimestamp = (ts: number) => {
    const diffMin = Math.floor((Date.now() - ts) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  return (
    <div className="pb-24 pt-2 max-w-md mx-auto min-h-screen">
      {/* Search Input Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mesh peers or handles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161b22] border border-white/10 text-gray-100 placeholder-gray-500 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-pink-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Horizontal Active Peers Carousel ("Instagram Stories") */}
      <div className="mb-6 px-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            Active Mesh Peers ({users.length})
          </span>
          <span className="text-[10px] text-pink-400 font-medium">Off-Grid P2P</span>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-1">
          {users.map((peer) => {
            const isDirect = peer.isDirect;
            return (
              <button
                key={peer.id}
                onClick={() => onSelectPeer(peer)}
                className="flex flex-col items-center space-y-1.5 shrink-0 group focus:outline-none"
              >
                {/* Circular Avatar Ring: Green for Direct, Vibrant Instagram Gradient for Mesh */}
                <div
                  className={`relative p-[2.5px] rounded-full transition-transform group-hover:scale-105 ${
                    isDirect
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'ig-gradient-ring shadow-lg shadow-pink-500/20'
                  }`}
                >
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-[#0b0e14]"
                  />
                  {/* Status Indicator Dot */}
                  <div
                    className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0b0e14] flex items-center justify-center ${
                      isDirect ? 'bg-emerald-400' : 'bg-pink-500'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                <span className="text-[11px] font-medium text-gray-300 max-w-[64px] truncate text-center group-hover:text-white">
                  {peer.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Direct Messages List */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <h2 className="text-sm font-semibold text-gray-200">Messages</h2>
          <span className="text-xs text-gray-500">P2P Encrypted</span>
        </div>

        <div className="space-y-2">
          {filteredUsers.map((peer) => {
            const lastMsg = getLastMessage(peer.id);
            const isDirect = peer.isDirect;

            return (
              <div
                key={peer.id}
                onClick={() => onSelectPeer(peer)}
                className="flex items-center space-x-3 p-3 rounded-2xl bg-[#161b22]/70 hover:bg-[#161b22] border border-white/5 hover:border-white/10 cursor-pointer transition-all group"
              >
                {/* Circular Avatar with Styled Ring */}
                <div
                  className={`relative p-[2.5px] rounded-full shrink-0 ${
                    isDirect ? 'bg-emerald-500' : 'ig-gradient-ring'
                  }`}
                >
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#0b0e14]"
                  />
                  {isDirect ? (
                    <span
                      title="Nearby Direct Link"
                      className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold p-0.5 rounded-full border border-[#0b0e14]"
                    >
                      <Wifi className="w-3 h-3" />
                    </span>
                  ) : (
                    <span
                      title="Multi-hop Mesh Relay Node"
                      className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-full border border-[#0b0e14] flex items-center gap-0.5"
                    >
                      <Zap className="w-2.5 h-2.5 text-yellow-300" />
                      {peer.hopCount}H
                    </span>
                  )}
                </div>

                {/* Info & Connection Subtitle */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-100 group-hover:text-pink-400 transition-colors truncate">
                      {peer.name}
                    </h3>
                    {lastMsg && (
                      <span className="text-[10px] text-gray-500 shrink-0">{formatTimestamp(lastMsg.timestamp)}</span>
                    )}
                  </div>

                  {/* Subtitle text showing connection status: "Nearby (Direct)" or "Mesh Node (2 Hops)" */}
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {isDirect ? (
                      <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Nearby (Direct)
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-medium text-pink-300 bg-pink-950/60 px-1.5 py-0.5 rounded border border-pink-500/30">
                        Mesh Node ({peer.hopCount} Hops)
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 truncate">@{peer.handle}</span>
                  </div>

                  {/* Message Preview */}
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {lastMsg ? lastMsg.payload : peer.bio || 'Tap to start P2P chat'}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 shrink-0 transition-colors" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
