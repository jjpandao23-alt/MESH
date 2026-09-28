import React, { useState, useEffect } from 'react';
import { Search, Radio, Wifi, Zap, ChevronRight } from 'lucide-react';
import { db } from '../db/storage';
import { User, Message } from '../db/schema';

interface DirectMessagesScreenProps {
  onSelectPeer: (peer: User) => void;
  selectedPeerId?: string;
}

export const DirectMessagesScreen: React.FC<DirectMessagesScreenProps> = ({ onSelectPeer, selectedPeerId }) => {
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
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto">
      {/* Search Input Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[3px]" />
          <input
            type="text"
            placeholder="SEARCH MESH PEERS OR HANDLES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-3 border-black text-black placeholder-gray-500 font-extrabold text-xs py-3 pl-10 pr-4 shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:bg-[#ffe600]"
          />
        </div>
      </div>

      {/* Active Peers Stories Carousel */}
      <div className="mb-6 bg-[#1a1a1a] border-3 border-black p-3 shadow-[4px_4px_0px_0px_#ff007f]">
        <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
          <span className="text-xs font-black uppercase text-[#ffe600] flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#00ff66] animate-pulse stroke-[3px]" />
            Active Mesh Peers ({users.length})
          </span>
          <span className="text-[10px] font-black bg-[#ff007f] text-white px-2 py-0.5 border border-black">
            OFF-GRID P2P
          </span>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
          {users.map((peer) => {
            const isDirect = peer.isDirect;
            return (
              <button
                key={peer.id}
                onClick={() => onSelectPeer(peer)}
                className="flex flex-col items-center space-y-1 shrink-0 group focus:outline-none"
              >
                <div
                  className={`relative p-1 border-3 border-black shadow-[3px_3px_0px_0px_#000000] transition-transform group-hover:-translate-y-1 ${
                    isDirect ? 'bg-[#00ff66]' : 'bg-[#ff007f]'
                  }`}
                >
                  <img src={peer.avatar} alt={peer.name} className="w-12 h-12 object-cover border border-black" />
                  <span
                    className={`absolute -bottom-1 -right-1 text-[9px] font-black text-black px-1 border border-black ${
                      isDirect ? 'bg-[#00ff66]' : 'bg-[#ffe600]'
                    }`}
                  >
                    {isDirect ? '1H' : `${peer.hopCount}H`}
                  </span>
                </div>
                <span className="text-[10px] font-black text-white max-w-[60px] truncate text-center uppercase">
                  {peer.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Peer Conversation List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b-3 border-black pb-2">
          <h2 className="text-sm font-black uppercase text-white tracking-wider">Messages Inbox</h2>
          <span className="text-[10px] font-black bg-[#00f0ff] text-black px-2 py-0.5 border-2 border-black">
            P2P ENCRYPTED
          </span>
        </div>

        {filteredUsers.map((peer) => {
          const lastMsg = getLastMessage(peer.id);
          const isDirect = peer.isDirect;
          const isSelected = selectedPeerId === peer.id;

          return (
            <div
              key={peer.id}
              onClick={() => onSelectPeer(peer)}
              className={`flex items-center space-x-3 p-3.5 border-3 border-black cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#ffe600] text-black shadow-[6px_6px_0px_0px_#ff007f] translate-x-1'
                  : 'bg-white hover:bg-gray-100 text-black shadow-[4px_4px_0px_0px_#000000] hover:-translate-y-0.5'
              }`}
            >
              {/* Circular Avatar */}
              <div
                className={`relative p-1 border-3 border-black shrink-0 ${
                  isDirect ? 'bg-[#00ff66]' : 'bg-[#ff007f]'
                }`}
              >
                <img src={peer.avatar} alt={peer.name} className="w-12 h-12 object-cover border border-black" />
                {isDirect ? (
                  <span className="absolute -bottom-1 -right-1 bg-[#00ff66] text-black p-0.5 border border-black">
                    <Wifi className="w-3 h-3 stroke-[3px]" />
                  </span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 bg-[#ffe600] text-black text-[9px] font-black px-1 border border-black flex items-center">
                    <Zap className="w-2.5 h-2.5 fill-black" />
                    {peer.hopCount}H
                  </span>
                )}
              </div>

              {/* Info & Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase truncate">{peer.name}</h3>
                  {lastMsg && (
                    <span className="text-[10px] font-extrabold bg-black text-white px-1.5 py-0.5 border border-black">
                      {formatTimestamp(lastMsg.timestamp)}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 mt-1">
                  {isDirect ? (
                    <span className="text-[9px] font-black uppercase bg-[#00ff66] text-black px-1.5 py-0.5 border border-black">
                      Nearby (Direct)
                    </span>
                  ) : (
                    <span className="text-[9px] font-black uppercase bg-[#ff007f] text-white px-1.5 py-0.5 border border-black">
                      Mesh Node ({peer.hopCount} Hops)
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-gray-700 truncate">@{peer.handle}</span>
                </div>

                <p className="text-xs font-bold text-gray-900 truncate mt-1">
                  {lastMsg ? lastMsg.payload : peer.bio || 'Tap to start P2P chat'}
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-black stroke-[3px] shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
