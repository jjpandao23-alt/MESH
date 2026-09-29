import React, { useState, useEffect } from 'react';
import { Compass, RefreshCw, Bluetooth, ShieldCheck } from 'lucide-react';
import { db } from '../db/storage';
import { User } from '../db/schema';
import { nativeBridge } from '../mesh/NativeBridge';
import { webBluetoothRadio } from '../mesh/WebBluetoothRadio';

interface RadarScreenProps {
  onSelectPeer: (peer: User) => void;
}

export const RadarScreen: React.FC<RadarScreenProps> = ({ onSelectPeer }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [isScanning, setIsScanning] = useState(true);
  const [bleConnected, setBleConnected] = useState(webBluetoothRadio.isHardwareConnected());

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

  const handleRequestBluetooth = async () => {
    const success = await webBluetoothRadio.requestWebBluetoothPermission();
    if (success) {
      setBleConnected(true);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto text-white">
      {/* Title Bar */}
      <div className="flex items-center justify-between mb-4 bg-[#00f0ff] text-black border-3 border-black p-3 shadow-[4px_4px_0px_0px_#000000]">
        <div>
          <h2 className="text-base font-black uppercase flex items-center gap-2">
            <Compass className="w-5 h-5 stroke-[3px]" />
            Peer Radar & Spectrum Scanner
          </h2>
          <p className="text-[11px] font-bold text-gray-800">2.4GHz BLE & Wi-Fi Direct Spectrum</p>
        </div>

        <button
          onClick={handleScanToggle}
          className={`flex items-center space-x-1.5 px-3 py-1.5 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000] transition-transform active:translate-x-0.5 ${
            isScanning ? 'bg-[#ff007f] text-white' : 'bg-white text-black'
          }`}
        >
          <RefreshCw className={`w-4 h-4 stroke-[3px] ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Start Scan'}</span>
        </button>
      </div>

      {/* Explicit Browser Bluetooth Permission Request Button */}
      <div className="mb-4 bg-[#ffe600] text-black border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black text-[#ffe600] border-2 border-black flex items-center justify-center font-black">
            <Bluetooth className="w-6 h-6 stroke-[3px]" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase">Bluetooth Radio Permission</h3>
            <p className="text-[11px] font-bold text-gray-900">
              {bleConnected ? 'Bluetooth Hardware Connected & Active' : 'Click to prompt browser / OS for physical Bluetooth scanning'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRequestBluetooth}
          className={`px-4 py-2 border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] transition-all active:translate-x-1 ${
            bleConnected ? 'bg-[#00ff66] text-black' : 'bg-[#ff007f] text-white hover:bg-[#00ff66] hover:text-black'
          }`}
        >
          {bleConnected ? 'Bluetooth Active' : 'Pair Bluetooth Hardware'}
        </button>
      </div>

      {/* Radar Scope */}
      <div className="relative w-72 h-72 mx-auto my-6 flex items-center justify-center bg-[#1a1a1a] border-4 border-black shadow-[8px_8px_0px_0px_#ff007f]">
        <div className="absolute inset-4 border-2 border-[#ffe600]/40 rounded-full" />
        <div className="absolute inset-12 border-2 border-[#00f0ff]/40 rounded-full" />
        <div className="absolute inset-20 border-2 border-[#00ff66]/40 rounded-full" />
        <div className="absolute w-full h-[2px] bg-white/20" />
        <div className="absolute h-full w-[2px] bg-white/20" />

        {/* Center indicator */}
        <div className="relative z-10 w-10 h-10 bg-[#ffe600] text-black border-3 border-black font-black text-[11px] flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
          YOU
        </div>

        {/* Plotted Node Dots */}
        {users.map((user, idx) => {
          const angle = (idx * (360 / users.length) * Math.PI) / 180;
          const radius = user.isDirect ? 50 : 95;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={user.id}
              onClick={() => onSelectPeer(user)}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute z-20 group focus:outline-none"
            >
              <div
                className={`p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] transition-transform group-hover:scale-125 ${
                  user.isDirect ? 'bg-[#00ff66]' : 'bg-[#ff007f]'
                }`}
              >
                <img src={user.avatar} alt={user.name} className="w-7 h-7 object-cover border border-black" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Peer Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-[#ffe600] tracking-wider border-b-2 border-black pb-1">
          Discovered Beacons ({users.length})
        </h3>

        {users.map((peer) => (
          <div
            key={peer.id}
            className="flex items-center justify-between p-3 bg-white text-black border-3 border-black shadow-[4px_4px_0px_0px_#000000]"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1 border-2 border-black ${peer.isDirect ? 'bg-[#00ff66]' : 'bg-[#ff007f]'}`}>
                <img src={peer.avatar} alt={peer.name} className="w-10 h-10 border border-black object-cover" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase">{peer.name}</h4>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-800 mt-0.5">
                  <span className={peer.isDirect ? 'bg-[#00ff66] px-1 border border-black' : 'bg-[#ff007f] text-white px-1 border border-black'}>
                    {peer.isDirect ? 'Direct Link' : `Mesh (${peer.hopCount} Hops)`}
                  </span>
                  <span>RSSI: {peer.rssi || -60} dBm</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPeer(peer)}
              className="px-3 py-1.5 bg-[#ffe600] border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000] hover:bg-[#ff007f] hover:text-white transition-colors"
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
