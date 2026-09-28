import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, Radio, Wifi, Zap, Key, Copy, Check, RotateCcw, Sliders, Moon, Sun } from 'lucide-react';
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
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen text-white">
      {/* Node Profile Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative p-[3px] rounded-full ig-gradient-ring shadow-xl shadow-pink-500/20 mb-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
            alt="Nova Vance"
            className="w-20 h-20 rounded-full object-cover border-4 border-[#0b0e14]"
          />
          <div className="absolute bottom-1 right-1 bg-emerald-400 w-4 h-4 rounded-full border-2 border-[#0b0e14]" />
        </div>

        <h2 className="text-base font-bold text-gray-100">{settings.nodeName}</h2>
        <p className="text-xs text-pink-400 font-medium mt-0.5">@{settings.nodeHandle}</p>
        <span className="mt-2 text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-full">
          Node ID: {settings.nodeId}
        </span>
      </div>

      {/* Cryptographic Key Card */}
      <div className="bg-[#161b22] border border-white/10 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-pink-400" />
            Node Public Key (ED25519)
          </span>
          <button
            onClick={handleCopyKey}
            className="flex items-center space-x-1 text-[10px] bg-white/5 hover:bg-white/10 text-gray-300 px-2 py-1 rounded border border-white/10 transition-colors"
          >
            {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="font-mono text-[11px] text-gray-400 break-all bg-[#0b0e14] p-2.5 rounded-xl border border-white/5">
          {settings.publicKey}
        </p>
      </div>

      {/* Radio & Mesh Settings */}
      <div className="bg-[#161b22] border border-white/10 rounded-2xl p-4 space-y-4 mb-4">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-pink-400" />
          Off-Grid Mesh Routing Config
        </h3>

        {/* Radio Toggles */}
        <div className="space-y-3 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Radio className="w-4 h-4 text-purple-400" />
              <div>
                <p className="font-semibold text-gray-200">Bluetooth Low Energy (BLE)</p>
                <p className="text-[10px] text-gray-400">Continuous background beacon & advertising</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('bleEnabled')}
              className={`w-11 h-6 rounded-full transition-colors p-1 ${
                settings.bleEnabled ? 'bg-pink-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.bleEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-gray-200">Wi-Fi Direct Peer Link</p>
                <p className="text-[10px] text-gray-400">High-bandwidth local payload transfer</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('wifiDirectEnabled')}
              className={`w-11 h-6 rounded-full transition-colors p-1 ${
                settings.wifiDirectEnabled ? 'bg-pink-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.wifiDirectEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="font-semibold text-gray-200">Silent Relay Forwarding</p>
                <p className="text-[10px] text-gray-400">Relay encrypted packets for nearby peers</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('relayModeEnabled')}
              className={`w-11 h-6 rounded-full transition-colors p-1 ${
                settings.relayModeEnabled ? 'bg-pink-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.relayModeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* TTL Slider */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-200">Max Time-To-Live (TTL)</span>
            <span className="text-pink-400 font-bold bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30">
              {settings.maxTtl} Hops
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            value={settings.maxTtl}
            onChange={(e) => handleTtlChange(Number(e.target.value))}
            className="w-full accent-pink-500 bg-gray-700 h-1.5 rounded-lg cursor-pointer"
          />
          <p className="text-[10px] text-gray-400">Controls how far multi-hop packets travel before expiring.</p>
        </div>
      </div>

      {/* Reset Data Button */}
      <button
        onClick={handleResetData}
        className="w-full py-3 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reset Mesh DB Cache & Restore Defaults</span>
      </button>
    </div>
  );
};
