import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Image as ImageIcon, Zap, CheckCheck, Clock, RefreshCw, Shield, Info, Heart, Flame, ThumbsUp } from 'lucide-react';
import { db } from '../db/storage';
import { User, Message } from '../db/schema';
import { meshProtocol } from '../mesh/MeshProtocol';
import { nativeBridge } from '../mesh/NativeBridge';

interface ChatScreenProps {
  peer: User;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ peer, onBack }) => {
  const [messages, setMessages] = useState<Message[]>(db.getMessages(peer.id));
  const [inputText, setInputText] = useState('');
  const [sendingStatusText, setSendingStatusText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const settings = db.getSettings();

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setMessages(db.getMessages(peer.id));
    });
    return () => unsub();
  }, [peer.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const payload = textToSend || inputText;
    if (!payload.trim()) return;

    setInputText('');
    setSendingStatusText('Sending...');

    // 1. Create packet and DB message record
    const { packet } = meshProtocol.createMessagePacket(peer.id, payload);

    // 2. Dispatch via Native Bridge (which handles multi-hop simulation)
    await nativeBridge.sendPacket(packet, (statusText) => {
      setSendingStatusText(statusText);
    });

    setSendingStatusText(null);
  };

  const sendQuickEmoji = (emoji: string) => {
    handleSendMessage(emoji);
  };

  const isDirect = peer.isDirect;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#0b0e14] text-white">
      {/* Instagram DM Header */}
      <header className="sticky top-0 z-30 bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar with styled connection ring */}
          <div className={`p-[2px] rounded-full ${isDirect ? 'bg-emerald-500' : 'ig-gradient-ring'}`}>
            <img src={peer.avatar} alt={peer.name} className="w-9 h-9 rounded-full object-cover border border-[#0b0e14]" />
          </div>

          <div>
            <h2 className="text-xs font-semibold text-gray-100 flex items-center space-x-1.5">
              <span>{peer.name}</span>
            </h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              {isDirect ? (
                <span className="text-[10px] text-emerald-400 font-medium">Nearby (Direct)</span>
              ) : (
                <span className="text-[10px] text-pink-300 font-medium">Mesh Node ({peer.hopCount} Hops)</span>
              )}
              <span className="text-[10px] text-gray-500">@{peer.handle}</span>
            </div>
          </div>
        </div>

        <button className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <Info className="w-5 h-5" />
        </button>
      </header>

      {/* Mesh Banner Context */}
      <div className="bg-[#161b22]/90 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-pink-400" />
          <span>
            {isDirect ? 'Direct Bluetooth / Wi-Fi Link' : `Multi-hop Relay Path (${peer.hopCount} Hops active)`}
          </span>
        </div>
        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300 font-mono">
          Max TTL: {settings.maxTtl}
        </span>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === settings.nodeId;

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs'
                    : 'bg-[#1c2330] border border-white/5 text-gray-100 rounded-bl-xs'
                }`}
              >
                <p className="break-words">{msg.payload}</p>

                <div className="flex items-center justify-end space-x-1.5 mt-1 text-[9px] opacity-75">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {/* Delivery Status reflects mesh architecture */}
                  {isMe && (
                    <span className="flex items-center space-x-1">
                      {msg.status === 'sending' && (
                        <span className="flex items-center text-amber-300 space-x-1">
                          <Clock className="w-2.5 h-2.5 animate-spin" />
                          <span>Sending...</span>
                        </span>
                      )}

                      {msg.status === 'hopping' && (
                        <span className="flex items-center text-pink-300 space-x-1">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Hopping ({msg.hopCount || 1})...</span>
                        </span>
                      )}

                      {msg.status === 'delivered' && (
                        <span className="flex items-center text-emerald-300 space-x-1">
                          <CheckCheck className="w-3 h-3" />
                          <span>{msg.isDirect ? 'Delivered (Direct)' : `Delivered (Mesh - ${msg.hopCount} Hops)`}</span>
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Active Sending Feedback Bar */}
      {sendingStatusText && (
        <div className="px-4 py-1.5 bg-pink-950/40 border-t border-pink-500/20 text-center text-xs text-pink-300 font-medium animate-pulse flex items-center justify-center space-x-2">
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          <span>Mesh Status: {sendingStatusText}</span>
        </div>
      )}

      {/* Quick Reactions & Input Field */}
      <div className="p-3 bg-[#0b0e14] border-t border-white/10 space-y-2">
        <div className="flex items-center space-x-2 justify-end px-1">
          {['❤️', '🔥', '👏', '👍'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendQuickEmoji(emoji)}
              className="px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 text-xs transition-transform active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Message anti-gravity peer..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-[#161b22] border border-white/10 text-gray-100 placeholder-gray-500 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500/50"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 disabled:opacity-40 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
