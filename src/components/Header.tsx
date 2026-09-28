import React, { useState, useEffect } from 'react';
import { Radio, ChevronDown, Shield, Sun, Moon, RefreshCw } from 'lucide-react';
import { db } from '../db/storage';
import { meshSimulator } from '../mesh/MeshSimulator';

interface HeaderProps {
  onOpenTopology?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTopology }) => {
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
    <header className="sticky top-0 z-40 bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/10 text-white px-4 py-3 flex items-center justify-between shadow-md">
      {/* Cursive Instagram-Style Logo */}
      <div className="flex items-center space-x-3">
        <h1 className="font-logo text-3xl tracking-wide bg-gradient-to-r from-pink-500 via-purple-400 to-yellow-400 bg-clip-text text-transparent select-none cursor-pointer">
          Anti Gravity
        </h1>
        <span className="text-[10px] font-semibold tracking-wider uppercase bg-purple-950/80 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
          Off-Grid Mesh
        </span>
      </div>

      {/* Right Action Icons & Mesh Active Status Indicator */}
      <div className="flex items-center space-x-3">
        {/* Node Simulator View Selector */}
        <div className="relative">
          <button
            onClick={() => setIsNodeMenuOpen(!isNodeMenuOpen)}
            className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
            title="Switch Simulated View Perspective"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-gray-200 hidden sm:inline">
              Node: {settings.nodeName.split(' ')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isNodeMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-400 border-b border-white/10">
                Simulated Node Viewpoint
              </div>
              {simNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    meshSimulator.setActiveNodeId(node.id);
                    setIsNodeMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    activeNodeId === node.id
                      ? 'bg-purple-600/30 text-purple-200 font-semibold border border-purple-500/40'
                      : 'hover:bg-white/5 text-gray-300'
                  }`}
                >
                  <img src={node.avatar} alt={node.name} className="w-6 h-6 rounded-full object-cover" />
                  <div className="flex-1 truncate">
                    <p className="truncate">{node.name}</p>
                    <p className="text-[10px] text-gray-400">@{node.handle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mesh Active Top-Right Pulsing Status Dot */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-950/60 to-pink-950/60 border border-pink-500/30 px-3 py-1 rounded-full">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-mesh-active" />
          </div>
          <span className="text-xs font-semibold tracking-wide bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent hidden md:inline">
            Mesh Active
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {settings.darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-300" />}
        </button>
      </div>
    </header>
  );
};
