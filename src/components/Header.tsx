import React, { useState, useEffect } from 'react';
import { ChevronDown, Sun, Moon, Radio, ShieldAlert } from 'lucide-react';
import { db } from '../db/storage';
import { meshSimulator } from '../mesh/MeshSimulator';

export const Header: React.FC = () => {
  const [settings, setSettings] = useState(db.getSettings());
  const [activeNodeId, setActiveNodeId] = useState(meshSimulator.getActiveNodeId());
  const [isNodeMenuOpen, setIsNodeMenuOpen] = useState(false);

  useEffect(() => {
    const unsubDb = db.subscribe(() => setSettings(db.getSettings()));
    const unsubSim = meshSimulator.subscribe(() => setActiveNodeId(meshSimulator.getActiveNodeId()));
    return () => {
      unsubDb();
      unsubSim();
    };
  }, []);

  const toggleDarkMode = () => {
    const updated = !settings.darkMode;
    db.updateSettings({ darkMode: updated });
    if (updated) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const simNodes = meshSimulator.getNodes();

  return (
    <header className="sticky top-0 z-40 bg-[#ffe600] border-b-4 border-black text-black px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Cursive Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-black text-[#ffe600] px-3 py-1 border-2 border-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_#ff007f] rotate-[-1deg]">
            P2P MESH
          </div>
          <h1 className="font-logo text-3xl md:text-4xl font-bold tracking-wide text-black select-none cursor-pointer">
            Anti Gravity
          </h1>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Node Simulator Selector */}
          <div className="relative">
            <button
              onClick={() => setIsNodeMenuOpen(!isNodeMenuOpen)}
              className="flex items-center space-x-2 bg-white text-black text-xs font-black px-3 py-1.5 border-3 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-[#00f0ff] transition-colors"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] border border-black animate-pulse" />
              <span>NODE: {settings.nodeName.split(' ')[0]}</span>
              <ChevronDown className="w-4 h-4 stroke-[3px]" />
            </button>

            {isNodeMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000000] z-50 p-2 space-y-1">
                <div className="px-2 py-1 text-[10px] uppercase font-black bg-black text-white mb-1">
                  Perspective Node Switcher
                </div>
                {simNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      meshSimulator.setActiveNodeId(node.id);
                      setIsNodeMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 border-2 border-black font-bold text-xs text-left transition-transform active:translate-x-1 ${
                      activeNodeId === node.id
                        ? 'bg-[#ff007f] text-white shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-gray-100 hover:bg-[#ffe600] text-black'
                    }`}
                  >
                    <img src={node.avatar} alt={node.name} className="w-6 h-6 rounded-full border border-black object-cover" />
                    <div className="flex-1 truncate">
                      <p className="truncate font-extrabold">{node.name}</p>
                      <p className="text-[10px] opacity-80">@{node.handle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mesh Active Pulsing Status Badge */}
          <div className="flex items-center space-x-2 bg-[#ff007f] text-white text-xs font-black px-3 py-1.5 border-3 border-black shadow-[3px_3px_0px_0px_#000000]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66] border border-black animate-ping" />
            <span className="tracking-wider uppercase">Mesh Active</span>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 bg-white border-3 border-black text-black shadow-[3px_3px_0px_0px_#000000] hover:bg-[#00f0ff] transition-colors"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 stroke-[3px]" /> : <Moon className="w-4 h-4 stroke-[3px]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
