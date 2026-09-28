import React, { useState } from 'react';
import { Send, Radio, Shield, CheckCircle } from 'lucide-react';
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
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto text-white">
      <div className="bg-[#ff007f] text-black border-4 border-black p-5 shadow-[8px_8px_0px_0px_#000000] space-y-4">
        <div className="flex items-center space-x-3 bg-white p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000000]">
          <div className="w-10 h-10 bg-[#ffe600] border-2 border-black flex items-center justify-center">
            <Radio className="w-6 h-6 stroke-[3px] text-black" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase">Broadcast to Mesh Network</h2>
            <p className="text-xs font-bold text-gray-800">Floods encrypted message to all nearby & multi-hop nodes</p>
          </div>
        </div>

        <textarea
          rows={4}
          placeholder="TYPE AN EMERGENCY OR GENERAL ANNOUNCEMENT TO ALL MESH PEERS..."
          value={broadcastText}
          onChange={(e) => setBroadcastText(e.target.value)}
          className="w-full bg-white text-black font-extrabold border-3 border-black p-3 text-xs shadow-[3px_3px_0px_0px_#000000] focus:outline-none focus:bg-[#ffe600]"
        />

        <div className="flex items-center justify-between text-xs font-black uppercase bg-[#00f0ff] text-black p-2 border-2 border-black">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 stroke-[3px]" />
            Targeting {users.length} Active Nodes
          </span>
          <span className="bg-black text-white px-2 py-0.5">FLOODING PROTOCOL</span>
        </div>

        {transmitted ? (
          <div className="p-3 bg-[#00ff66] border-3 border-black text-black text-xs font-black uppercase flex items-center justify-center space-x-2 shadow-[4px_4px_0px_0px_#000000]">
            <CheckCircle className="w-5 h-5 stroke-[3px]" />
            <span>Broadcast Packet Transmitted to All Mesh Neighbors!</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white border-3 border-black text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastText.trim() || isTransmitting}
              className="flex-1 py-3 bg-[#ffe600] disabled:opacity-50 border-3 border-black text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] hover:bg-[#00ff66] transition-transform active:translate-x-1 flex items-center justify-center space-x-2"
            >
              {isTransmitting ? (
                <span>Transmitting...</span>
              ) : (
                <>
                  <Send className="w-4 h-4 stroke-[3px]" />
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
