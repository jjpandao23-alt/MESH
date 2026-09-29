import React, { useState, useEffect } from 'react';
import { ChevronDown, Sun, Moon, Globe, Key } from 'lucide-react';
import { db } from '../db/storage';
import { meshSimulator } from '../mesh/MeshSimulator';
import { peerJSMeshDriver } from '../mesh/PeerJSMeshDriver';

export const Header: React.FC = () => {
  const [settings, setSettings] = useState(db.getSettings());
  const [activeNodeId, setActiveNodeId] = useState(meshSimulator.getActiveNodeId());
  const [isNodeMenuOpen, setIsNodeMenuOpen] = useState(false);
  const [peerCount, setPeerCount] = useState(peerJSMeshDriver.getConnectedPeerCount());
  const [roomCode, setRoomCode] = useState(peerJSMeshDriver.getRoomCode());
  const [isChangingRoom, setIsChangingRoom] = useState(false);
  const [inputRoomCode, setInputRoomCode] = useState(roomCode);

  useEffect(() => {
    const unsubDb = db.subscribe(() => setSettings(db.getSettings()));
    const unsubSim = meshSimulator.subscribe(() => setActiveNodeId(meshSimulator.getActiveNodeId()));
    const unsubPeerJS = peerJSMeshDriver.subscribe(() => {
      setPeerCount(peerJSMeshDriver.getConnectedPeerCount());
      setRoomCode(peerJSMeshDriver.getRoomCode());
    });
    return () => {
      unsubDb();
      unsubSim();
      unsubPeerJS();
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

  const handleJoinRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoomCode.trim()) {
      peerJSMeshDriver.initPeerJS(inputRoomCode);
      setIsChangingRoom(false);
    }
  };

  const simNodes = meshSimulator.getNodes();

  return (
    <header className="sticky top-0 z-40 bg-[#ffe600] border-b-4 border-black text-black px-3 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Brand & Cursive Logo */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-black text-[#ffe600] px-2.5 py-0.5 border-2 border-black font-black uppercase text-[10px] sm:text-xs tracking-wider shadow-[2px_2px_0px_0px_#ff007f]">
            OFF-GRID MESH
          </div>
          <h1 className="font-logo text-2xl sm:text-3xl font-bold text-black select-none">
            Anti Gravity
          </h1>
        </div>

        {/* Room Code Selector / PeerJS Status */}
        <div className="flex items-center space-x-2 shrink-0">
          {isChangingRoom ? (
            <form onSubmit={handleJoinRoomSubmit} className="flex items-center space-x-1">
              <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value)}
                placeholder="ROOM CODE"
                className="bg-white text-black font-black text-xs px-2 py-1 border-2 border-black w-24 uppercase"
              />
              <button
                type="submit"
                className="bg-[#00ff66] text-black font-black text-xs px-2 py-1 border-2 border-black uppercase shadow-[2px_2px_0px_0px_#000000]"
              >
                JOIN
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsChangingRoom(true)}
              className="flex items-center space-x-1.5 bg-[#ff007f] text-white text-xs font-black px-3 py-1.5 border-3 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-[#00ff66] hover:text-black transition-all active:translate-x-0.5"
            >
              <Globe className="w-4 h-4 stroke-[3px]" />
              <span className="uppercase">ROOM: {roomCode}</span>
              <span className="bg-black text-[#ffe600] text-[10px] px-1.5 py-0.5 border border-black font-extrabold ml-1">
                {peerCount} PEERS
              </span>
            </button>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsNodeMenuOpen(!isNodeMenuOpen)}
              className="flex items-center space-x-1 bg-white text-black text-[11px] font-black px-2.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#00f0ff] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#00ff66] border border-black animate-pulse" />
              <span className="hidden md:inline">NODE: {settings.nodeName.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 stroke-[3px]" />
            </button>

            {isNodeMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000000] z-50 p-2 space-y-1">
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
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 border-2 border-black font-bold text-xs text-left transition-transform active:translate-x-1 ${
                      activeNodeId === node.id
                        ? 'bg-[#ff007f] text-white shadow-[2px_2px_0px_0px_#000000]'
                        : 'bg-gray-100 hover:bg-[#ffe600] text-black'
                    }`}
                  >
                    <img src={node.avatar} alt={node.name} className="w-5 h-5 rounded-full border border-black object-cover" />
                    <div className="flex-1 truncate">
                      <p className="truncate font-extrabold text-[11px]">{node.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-1.5 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-[#00f0ff] transition-colors"
          >
            {settings.darkMode ? <Sun className="w-4 h-4 stroke-[3px]" /> : <Moon className="w-4 h-4 stroke-[3px]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
