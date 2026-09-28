import React, { useState } from 'react';
import { Send, Radio, Shield, Sparkles, CheckCircle } from 'lucide-react';
import { db } from '../db/storage';
import { meshProtocol } from '../mesh/MeshProtocol';
import { nativeBridge } from '../mesh/NativeBridge';

interface BroadcastScreenProps {
  onClose: () => void;
}

export const BroadcastScreen: React.FC<BroadcastScreenProps> = ({ onClose }) => {
  const [broadcastText, setBroadcastText] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);
  const users = db.getUsers();

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setIsTransmitting(true);

    // Send packet to all known peers in parallel
    for (const peer of users) {
      const { packet } = meshProtocol.createMessagePacket(peer.id, `📢 [Mesh Broadcast] ${broadcastText}`);
      await nativeBridge.sendPacket(packet);
    }

    setIsTransmitting(false);
    setTransmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen text-white">
      <div className="bg-[#161b22] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5 flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-100">Broadcast to Mesh Network</h2>
            <p className="text-xs text-gray-400">Floods encrypted payload to all nearby & multi-hop nodes</p>
          </div>
        </div>

        <textarea
          rows={4}
          placeholder="Type an off-grid emergency or general announcement to all mesh peers..."
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          className="w-full bg-[#0b0e14] border border-white/10 text-gray-100 placeholder-gray-500 rounded-xl p-3 text-xs focus:outline-none focus:border-pink-500/50"
        />

        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-pink-400" />
            Targeting {users.length} Active Nodes
          </span>
          <span className="text-pink-300 font-medium">Flooding Protocol Active</span>
        </div>

        {transmitted ? (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>Broadcast Packet Transmitted to All Mesh Neighbors!</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastText.trim() || isTransmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              {isTransmitting ? (
                <span>Transmitting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Broadcast</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
