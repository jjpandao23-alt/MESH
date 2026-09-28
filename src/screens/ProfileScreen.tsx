import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, RotateCcw, Sliders, Radio, Wifi, Zap } from 'lucide-react';
import { db } from '../db/storage';
import { AppSettings } from '../db/schema';

export const ProfileScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => setSettings(db.getSettings()));
    return () => unsub();
  }, []);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(settings.publicKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleToggle = (key: keyof AppSettings) => {
    const currentValue = settings[key];
    if (typeof currentValue === 'boolean') {
      db.updateSettings({ [key]: !currentValue });
    }
  };

  const handleTtlChange = (val: number) => {
    db.updateSettings({ maxTtl: val });
  };

  const handleResetData = () => {
    if (confirm('Reset Anti Gravity mesh cache and restore default test nodes?')) {
      db.resetAllData();
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto text-white">
      {/* Node Profile Header */}
      <div className="bg-[#a855f7] text-black border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000000] mb-6 flex flex-col items-center text-center">
        <div className="p-1 border-3 border-black bg-white shadow-[3px_3px_0px_0px_#000000] mb-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
            alt="Nova Vance"
            className="w-20 h-20 border border-black object-cover"
          />
        </div>

        <h2 className="text-lg font-black uppercase">{settings.nodeName}</h2>
        <p className="text-xs font-bold text-gray-900">@{settings.nodeHandle}</p>
        <span className="mt-2 text-[10px] font-black bg-black text-[#ffe600] px-3 py-1 border border-black uppercase">
          NODE ID: {settings.nodeId}
        </span>
      </div>

      {/* Cryptographic Public Key Card */}
      <div className="bg-white text-black border-3 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase flex items-center gap-1.5">
            <Key className="w-4 h-4 text-[#ff007f] stroke-[3px]" />
            Node Public Key (ED25519)
          </span>
          <button
            onClick={handleCopyKey}
            className="flex items-center space-x-1 text-[10px] font-black uppercase bg-[#ffe600] text-black px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#00f0ff] transition-colors"
          >
            {copiedKey ? <Check className="w-3 h-3 stroke-[3px]" /> : <Copy className="w-3 h-3 stroke-[3px]" />}
            <span>{copiedKey ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="font-mono text-[11px] font-bold text-black break-all bg-gray-100 p-2.5 border-2 border-black">
          {settings.publicKey}
        </p>
      </div>

      {/* Routing Config */}
      <div className="bg-[#1a1a1a] border-4 border-black p-5 shadow-[6px_6px_0px_0px_#00f0ff] space-y-4 mb-4">
        <h3 className="text-xs font-black uppercase text-[#ffe600] flex items-center gap-1.5 border-b-2 border-black pb-2">
          <Sliders className="w-4 h-4 stroke-[3px]" />
          Off-Grid Mesh Routing Config
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-white text-black p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center space-x-3">
              <Radio className="w-5 h-5 text-[#ff007f] stroke-[3px]" />
              <div>
                <p className="font-black text-xs uppercase">Bluetooth Low Energy (BLE)</p>
                <p className="text-[10px] font-bold text-gray-700">Continuous 2.4GHz beacon & scanning</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('bleEnabled')}
              className={`px-3 py-1 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${
                settings.bleEnabled ? 'bg-[#00ff66] text-black' : 'bg-gray-300 text-black'
              }`}
            >
              {settings.bleEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-white text-black p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center space-x-3">
              <Wifi className="w-5 h-5 text-[#00f0ff] stroke-[3px]" />
              <div>
                <p className="font-black text-xs uppercase">Wi-Fi Direct Link</p>
                <p className="text-[10px] font-bold text-gray-700">High-bandwidth local payload link</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('wifiDirectEnabled')}
              className={`px-3 py-1 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${
                settings.wifiDirectEnabled ? 'bg-[#00ff66] text-black' : 'bg-gray-300 text-black'
              }`}
            >
              {settings.wifiDirectEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-white text-black p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-[#ffe600] stroke-[3px]" />
              <div>
                <p className="font-black text-xs uppercase">Silent Relay Mode</p>
                <p className="text-[10px] font-bold text-gray-700">Forward encrypted packets for peers</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('relayModeEnabled')}
              className={`px-3 py-1 font-black text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000000] ${
                settings.relayModeEnabled ? 'bg-[#00ff66] text-black' : 'bg-gray-300 text-black'
              }`}
            >
              {settings.relayModeEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* TTL Slider */}
        <div className="bg-white text-black p-3 border-3 border-black shadow-[3px_3px_0px_0px_#000000] space-y-2">
          <div className="flex items-center justify-between text-xs font-black uppercase">
            <span>Max Time-To-Live (TTL)</span>
            <span className="bg-[#ff007f] text-white px-2 py-0.5 border border-black">
              {settings.maxTtl} Hops
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={settings.maxTtl}
            onChange={(e) => handleTtlChange(Number(e.target.value))}
            className="w-full accent-[#ff007f] cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={handleResetData}
        className="w-full py-3 bg-[#ff2a2a] text-white border-3 border-black font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000000] hover:bg-black transition-colors"
      >
        <div className="flex items-center justify-center space-x-2">
          <RotateCcw className="w-4 h-4 stroke-[3px]" />
          <span>Reset Mesh DB Cache & Restore Defaults</span>
        </div>
      </button>
    </div>
  );
};
