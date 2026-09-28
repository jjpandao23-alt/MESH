import React, { useState, useEffect } from 'react';
import { Activity, Network } from 'lucide-react';
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
        return 'bg-[#00ff66] text-black border-black';
      case 'mesh':
        return 'bg-[#ff007f] text-white border-black';
      case 'warn':
        return 'bg-[#ffe600] text-black border-black';
      default:
        return 'bg-[#00f0ff] text-black border-black';
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-2xl mx-auto text-white">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 bg-[#00ff66] text-black border-3 border-black p-3 shadow-[4px_4px_0px_0px_#000000]">
        <div>
          <h2 className="text-base font-black uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 stroke-[3px]" />
            Network Activity & Topology
          </h2>
          <p className="text-[11px] font-bold text-gray-800">Node Graph & Radio Packet Telemetry</p>
        </div>

        <div className="flex bg-white p-1 border-2 border-black">
          <button
            onClick={() => setActiveTab('topology')}
            className={`px-3 py-1 font-black text-xs uppercase border border-black ${
              activeTab === 'topology' ? 'bg-[#ff007f] text-white shadow-[2px_2px_0px_0px_#000000]' : 'text-black'
            }`}
          >
            Topology
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 font-black text-xs uppercase border border-black ${
              activeTab === 'logs' ? 'bg-[#ff007f] text-white shadow-[2px_2px_0px_0px_#000000]' : 'text-black'
            }`}
          >
            Logs ({logs.length})
          </button>
        </div>
      </div>

      {activeTab === 'topology' ? (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border-4 border-black p-4 shadow-[8px_8px_0px_0px_#ffe600]">
            <div className="flex items-center justify-between mb-3 border-b-2 border-black pb-2 text-xs font-black uppercase text-[#ffe600]">
              <span className="flex items-center gap-1.5">
                <Network className="w-4 h-4 stroke-[3px]" />
                Live Topology Graph (Click link to toggle)
              </span>
              <span className="bg-[#00ff66] text-black px-2 py-0.5 border border-black">
                5 Active Nodes
              </span>
            </div>

            <svg className="w-full h-64 border-3 border-black bg-white rounded-none">
              {simLinks.map((link, idx) => {
                const sourceNode = simNodes.find((n) => n.id === link.fromNodeId);
                const targetNode = simNodes.find((n) => n.id === link.toNodeId);
                if (!sourceNode || !targetNode) return null;

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
                      stroke={link.active ? '#ff007f' : '#9ca3af'}
                      strokeWidth={link.active ? '3.5' : '1.5'}
                      strokeDasharray={link.active ? 'none' : '4 4'}
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 4}
                      fill="#000000"
                      fontSize="10"
                      fontWeight="900"
                      textAnchor="middle"
                    >
                      {link.rssi} dBm
                    </text>
                  </g>
                );
              })}

              {simNodes.map((node) => {
                const nx = (node.x / 750) * 280 + 20;
                const ny = (node.y / 350) * 180 + 20;

                return (
                  <g key={node.id} className="cursor-pointer">
                    <circle
                      cx={nx}
                      cy={ny}
                      r="16"
                      fill={node.id === 'node_alpha_01' ? '#ffe600' : '#00f0ff'}
                      stroke="#000000"
                      strokeWidth="3"
                    />
                    <image href={node.avatar} x={nx - 13} y={ny - 13} height="26" width="26" />
                    <text x={nx} y={ny + 25} fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-[#00f0ff] border-b-2 border-black pb-1">
              Simulated Fleet Nodes
            </h3>

            {simNodes.map((node) => (
              <div
                key={node.id}
                className="flex items-center justify-between p-3 bg-white text-black border-3 border-black shadow-[3px_3px_0px_0px_#000000]"
              >
                <div className="flex items-center space-x-3">
                  <img src={node.avatar} alt={node.name} className="w-8 h-8 border border-black object-cover" />
                  <div>
                    <p className="font-black text-xs uppercase">{node.name}</p>
                    <p className="text-[10px] font-bold text-gray-700">ID: {node.id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-black uppercase">
                  <span className="bg-[#ffe600] px-1.5 py-0.5 border border-black">🔋 {node.battery}%</span>
                  <span className="bg-[#ff007f] text-white px-1.5 py-0.5 border border-black">Relay Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 border-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-bold leading-relaxed space-y-1 ${getLogLevelStyle(log.level)}`}
            >
              <div className="flex items-center justify-between text-[10px] font-black uppercase border-b border-black/30 pb-1">
                <span>{log.action}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="font-mono text-[11px] pt-0.5">{log.details}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
