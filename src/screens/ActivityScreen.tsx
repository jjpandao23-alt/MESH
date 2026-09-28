import React, { useState, useEffect } from 'react';
import { Activity, Network, Shield, Zap, Terminal, RefreshCw, Radio } from 'lucide-react';
import { db } from '../db/storage';
import { NetworkLog } from '../db/schema';
import { meshSimulator, SimNode, SimLink } from '../mesh/MeshSimulator';

export const ActivityScreen: React.FC = () => {
  const [logs, setLogs] = useState<NetworkLog[]>(db.getLogs());
  const [simNodes, setSimNodes] = useState<SimNode[]>(meshSimulator.getNodes());
  const [simLinks, setSimLinks] = useState<SimLink[]>(meshSimulator.getLinks());
  const [activeTab, setActiveTab] = useState<'topology' | 'logs'>('topology');

  useEffect(() => {
    const unsubDb = db.subscribe(() => setLogs(db.getLogs()));
    const unsubSim = meshSimulator.subscribe(() => {
      setSimNodes(meshSimulator.getNodes());
      setSimLinks(meshSimulator.getLinks());
    });
    return () => {
      unsubDb();
      unsubSim();
    };
  }, []);

  const getLogLevelStyle = (level: NetworkLog['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'mesh':
        return 'text-pink-300 bg-pink-950/40 border-pink-500/30';
      case 'warn':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      default:
        return 'text-blue-300 bg-blue-950/40 border-blue-500/30';
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen text-white">
      {/* Header & Tabs Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-400" />
            Network Activity & Mesh Graph
          </h2>
          <p className="text-xs text-gray-400">P2P Node Topology & Radio Packet Telemetry</p>
        </div>

        <div className="flex bg-[#161b22] p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              activeTab === 'topology' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Topology
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 rounded-lg transition-colors font-medium ${
              activeTab === 'logs' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Logs ({logs.length})
          </button>
        </div>
      </div>

      {activeTab === 'topology' ? (
        <div className="space-y-4">
          {/* Interactive Topology Graph Container */}
          <div className="relative bg-[#161b22] border border-white/10 rounded-2xl p-4 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Network className="w-4 h-4 text-pink-400" />
                Live Mesh Node Graph (Tap link to simulate disconnect)
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                5 Active Nodes
              </span>
            </div>

            {/* SVG Link Overlay */}
            <svg className="w-full h-64 border border-white/5 rounded-xl bg-[#0b0e14]/80">
              <defs>
                <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#833ab4" />
                  <stop offset="50%" stopColor="#fd1d1d" />
                  <stop offset="100%" stopColor="#fcb045" />
                </linearGradient>
              </defs>

              {/* Draw Mesh Links */}
              {simLinks.map((link, idx) => {
                const sourceNode = simNodes.find((n) => n.id === link.fromNodeId);
                const targetNode = simNodes.find((n) => n.id === link.toNodeId);
                if (!sourceNode || !targetNode) return null;

                // Scale coordinates into 300x220 canvas
                const x1 = (sourceNode.x / 750) * 280 + 20;
                const y1 = (sourceNode.y / 350) * 180 + 20;
                const x2 = (targetNode.x / 750) * 280 + 20;
                const y2 = (targetNode.y / 350) * 180 + 20;

                return (
                  <g key={idx} className="cursor-pointer" onClick={() => meshSimulator.toggleLink(link.fromNodeId, link.toNodeId)}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={link.active ? 'url(#linkGradient)' : '#374151'}
                      strokeWidth={link.active ? '2.5' : '1'}
                      strokeDasharray={link.active ? 'none' : '4 4'}
                      className="transition-all duration-300 hover:stroke-yellow-400"
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 4}
                      fill={link.active ? '#f472b6' : '#6b7280'}
                      fontSize="9"
                      textAnchor="middle"
                      className="font-mono select-none"
                    >
                      {link.rssi} dBm
                    </text>
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {simNodes.map((node) => {
                const nx = (node.x / 750) * 280 + 20;
                const ny = (node.y / 350) * 180 + 20;

                return (
                  <g key={node.id} className="cursor-pointer">
                    <circle
                      cx={nx}
                      cy={ny}
                      r="16"
                      fill="#161b22"
                      stroke={node.id === 'node_alpha_01' ? '#10b981' : '#ec4899'}
                      strokeWidth="2.5"
                    />
                    <image
                      href={node.avatar}
                      x={nx - 14}
                      y={ny - 14}
                      height="28"
                      width="28"
                      clipPath="circle(14px at 14px 14px)"
                    />
                    <text
                      x={nx}
                      y={ny + 24}
                      fill="#e5e7eb"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="select-none"
                    >
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-gray-400">
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Green Node: Local Node (Node Alpha)</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                <span>Gradient Link: Active Mesh Relay Path</span>
              </div>
            </div>
          </div>

          {/* Node Status Summary Cards */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Simulated Node Fleet
            </h3>

            {simNodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#161b22] border border-white/5 text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <img src={node.avatar} alt={node.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-200">{node.name}</p>
                    <p className="text-[10px] text-gray-400">ID: {node.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[10px]">
                  <span className="text-gray-400">🔋 {node.battery}%</span>
                  <span className="bg-pink-950/60 text-pink-300 px-2 py-0.5 rounded border border-pink-500/30">
                    Relay Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Real-time Network Log Stream */
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${getLogLevelStyle(log.level)}`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-80 border-b border-white/10 pb-1">
                <span className="font-mono font-bold">{log.action}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="font-mono text-[11px] text-gray-200 pt-0.5">{log.details}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
