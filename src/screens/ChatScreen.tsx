import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Shield, Info, CheckCheck, Clock, RefreshCw, Zap } from 'lucide-react';
import { db } from '../db/storage';
import { User, Message } from '../db/schema';
import { meshProtocol } from '../mesh/MeshProtocol';
import { nativeBridge } from '../mesh/NativeBridge';

interface ChatScreenProps {
  peer: User;
  onBack?: () => void;
  isEmbedded?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ peer, onBack, isEmbedded = false }) => {
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

    const { packet } = meshProtocol.createMessagePacket(peer.id, payload);

    await nativeBridge.sendPacket(packet, (statusText) => {
      setSendingStatusText(statusText);
    });

    setSendingStatusText(null);
  };

  const isDirect = peer.isDirect;

  return (
    <div className={`flex flex-col h-full bg-[#121212] text-white border-3 border-black ${isEmbedded ? 'rounded-none shadow-none' : 'max-w-md mx-auto min-h-screen'}`}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#ffe600] text-black border-b-3 border-black px-4 py-3 flex items-center justify-between shadow-[0px_3px_0px_0px_#000000]">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#ff007f] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 stroke-[3px]" />
            </button>
          )}

          <div className={`p-1 border-2 border-black ${isDirect ? 'bg-[#00ff66]' : 'bg-[#ff007f]'}`}>
            <img src={peer.avatar} alt={peer.name} className="w-9 h-9 border border-black object-cover" />
          </div>

          <div>
            <h2 className="text-xs font-black uppercase tracking-wider">{peer.name}</h2>
            <div className="flex items-center space-x-1.5 mt-0.5">
              {isDirect ? (
                <span className="text-[9px] font-black uppercase bg-[#00ff66] text-black px-1 border border-black">
                  Direct
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase bg-[#ff007f] text-white px-1 border border-black">
                  {peer.hopCount} Hops
                </span>
              )}
              <span className="text-[10px] font-bold text-gray-800">@{peer.handle}</span>
            </div>
          </div>
        </div>

        <button className="p-1 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000]">
          <Info className="w-5 h-5 stroke-[3px]" />
        </button>
      </header>

      {/* Network Info Banner */}
      <div className="bg-[#00f0ff] text-black px-4 py-2 border-b-3 border-black flex items-center justify-between text-xs font-black uppercase">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 stroke-[3px]" />
          <span>{isDirect ? 'Direct BLE/Wi-Fi Link' : `Multi-hop Relay (${peer.hopCount} Hops)`}</span>
        </div>
        <span className="bg-black text-[#ffe600] px-2 py-0.5 text-[10px] border border-black">
          TTL: {settings.maxTtl}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === settings.nodeId;

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[82%] px-4 py-2.5 border-3 border-black text-xs font-bold leading-relaxed ${
                  isMe
                    ? 'bg-[#ffe600] text-black shadow-[4px_4px_0px_0px_#ff007f]'
                    : 'bg-white text-black shadow-[4px_4px_0px_0px_#00f0ff]'
                }`}
              >
                <p className="break-words">{msg.payload}</p>

                <div className="flex items-center justify-end space-x-1.5 mt-1.5 text-[9px] font-black uppercase border-t border-black/20 pt-1">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                  {isMe && (
                    <span className="flex items-center space-x-1">
                      {msg.status === 'sending' && (
                        <span className="flex items-center text-black bg-[#00f0ff] px-1 border border-black">
                          <Clock className="w-2.5 h-2.5 animate-spin" />
                          <span>Sending...</span>
                        </span>
                      )}

                      {msg.status === 'hopping' && (
                        <span className="flex items-center text-white bg-[#ff007f] px-1 border border-black">
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                          <span>Hop ({msg.hopCount})...</span>
                        </span>
                      )}

                      {msg.status === 'delivered' && (
                        <span className="flex items-center text-black bg-[#00ff66] px-1 border border-black">
                          <CheckCheck className="w-3 h-3 stroke-[3px]" />
                          <span>{msg.isDirect ? 'Direct' : `${msg.hopCount}H`}</span>
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

      {/* Sending Status Progress Bar */}
      {sendingStatusText && (
        <div className="px-4 py-1.5 bg-[#ff007f] text-white border-t-3 border-black text-center text-xs font-black uppercase flex items-center justify-center space-x-2 animate-pulse">
          <Zap className="w-4 h-4 text-[#ffe600] fill-[#ffe600]" />
          <span>Status: {sendingStatusText}</span>
        </div>
      )}

      {/* Quick Reactions & Input Field */}
      <div className="p-3 bg-[#1a1a1a] border-t-3 border-black space-y-2">
        <div className="flex items-center space-x-2 justify-end px-1">
          {['❤️', '🔥', '👏', '👍'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSendMessage(emoji)}
              className="px-2.5 py-1 bg-white border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_#000000] hover:bg-[#ffe600] transition-transform active:translate-x-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="TYPE OFF-GRID MESSAGE..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-white text-black font-extrabold border-3 border-black px-4 py-2.5 text-xs shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:bg-[#ffe600]"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-[#ff007f] disabled:opacity-50 text-white font-black border-3 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-[#00ff66] hover:text-black transition-all active:translate-x-1"
          >
            <Send className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
