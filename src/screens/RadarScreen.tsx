import React, { useState, useEffect } from 'react';
import { Compass, Radio, Wifi, Zap, RefreshCw, ShieldCheck } from 'lucide-react';
import { db } from '../db/storage';
import { User } from '../db/schema';
import { nativeBridge } from '../mesh/NativeBridge';

interface RadarScreenProps {
  onSelectPeer: (peer: User) => void;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({ onSelectPeer }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const unsub = db.subscribe(() => setUsers(db.getUsers()));
    return () => unsub();
  }, []);

  const handleScanToggle = () => {
    if (isScanning) {
      nativeBridge.stopDiscovery();
      setIsScanning(false);
    } else {
      nativeBridge.startDiscovery();
      setIsScanning(true);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen text-white">
      {/* Screen Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-pink-400" />
            Peer Radar & Scanner
          </h2>
          <p className="text-xs text-gray-400">Scanning 2.4GHz BLE & Wi-Fi Direct Spectrum</p>
        </div>

        <button
          onClick={handleScanToggle}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            isScanning
              ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
              : 'bg-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-pink-400' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Start Scan'}</span>
        </button>
      </div>

      {/* Interactive Animated Radar Scope */}
      <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
        {/* Concentric Radar Rings */}
        <div className="absolute inset-0 rounded-full border border-pink-500/20 bg-pink-950/10" />
        <div className="absolute inset-8 rounded-full border border-pink-500/30" />
        <div className="absolute inset-16 rounded-full border border-pink-500/40" />
        <div className="absolute inset-24 rounded-full border border-pink-500/50" />

        {/* Crosshair lines */}
        <div className="absolute w-full h-[1px] bg-pink-500/20" />
        <div className="absolute h-full w-[1px] bg-pink-500/20" />

        {/* Radar Ping Animation */}
        {isScanning && <div className="absolute inset-0 rounded-full border-2 border-pink-500 animate-radar-ping pointer-events-none" />}

        {/* Local Node Center Indicator */}
        <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-600 p-0.5 shadow-lg shadow-pink-500/40">
          <div className="w-full h-full bg-[#0b0e14] rounded-full flex items-center justify-center text-[10px] font-bold text-pink-400">
            YOU
          </div>
        </div>

        {/* Plotted Node Dots on Radar */}
        {users.map((user, idx) => {
          // Calculate polar coordinates for visual radar plotting
          const angle = (idx * (360 / users.length) * Math.PI) / 180;
          const radius = user.isDirect ? 45 : 85; // direct closer, mesh further
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={user.id}
              onClick={() => onSelectPeer(user)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute z-20 group focus:outline-none"
              title={`${user.name} (${user.isDirect ? 'Direct' : 'Mesh'})`}
            >
              <div
                className={`p-1 rounded-full transition-transform group-hover:scale-125 ${
                  user.isDirect ? 'bg-emerald-500' : 'ig-gradient-ring'
                }`}
              >
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Discovered Peer Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Nearby Discovered Beacons ({users.length})
        </h3>

        {users.map((peer) => (
          <div
            key={peer.id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#161b22] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-[2px] rounded-full ${peer.isDirect ? 'bg-emerald-500' : 'ig-gradient-ring'}`}>
                <img src={peer.avatar} alt={peer.name} className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-100">{peer.name}</h4>
                <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                  <span className={peer.isDirect ? 'text-emerald-400 font-medium' : 'text-pink-300 font-medium'}>
                    {peer.isDirect ? 'Direct Link' : `Mesh (${peer.hopCount} Hops)`}
                  </span>
                  <span>•</span>
                  <span>RSSI: {peer.rssi || -60} dBm</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPeer(peer)}
              className="px-3 py-1.5 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 border border-pink-500/40 text-xs font-medium transition-colors"
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
