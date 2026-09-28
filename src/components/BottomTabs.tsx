import React from 'react';
import { MessageSquare, Compass, PlusCircle, Activity, User, Radio } from 'lucide-react';

export type TabType = 'messages' | 'radar' | 'broadcast' | 'activity' | 'profile';

interface BottomTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  const tabs = [
    { id: 'messages' as TabType, label: 'Chats', icon: MessageSquare, badge: unreadCount, color: 'bg-[#ffe600]' },
    { id: 'radar' as TabType, label: 'Radar', icon: Compass, color: 'bg-[#00f0ff]' },
    { id: 'broadcast' as TabType, label: 'Add (+)', icon: PlusCircle, isPrimary: true, color: 'bg-[#ff007f]' },
    { id: 'activity' as TabType, label: 'Activity', icon: Activity, color: 'bg-[#00ff66]' },
    { id: 'profile' as TabType, label: 'Profile', icon: User, color: 'bg-[#a855f7]' },
  ];

  return (
    <>
      {/* Desktop Left Sidebar Navigation (Visible on lg screens) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1a1a1a] border-r-4 border-black p-4 space-y-3 min-h-screen text-white">
        <div className="bg-[#ffe600] text-black border-3 border-black p-3 shadow-[4px_4px_0px_0px_#ff007f] mb-4">
          <div className="flex items-center space-x-2 font-black text-xs uppercase">
            <Radio className="w-4 h-4 stroke-[3px] text-black" />
            <span>Off-Grid P2P Engine</span>
          </div>
          <p className="text-[11px] font-bold text-gray-800 mt-1">BLE & Wi-Fi Direct Mesh Active</p>
        </div>

        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 border-3 border-black text-xs font-black uppercase transition-all ${
                  isActive
                    ? `${tab.color} text-black shadow-[4px_4px_0px_0px_#000000] translate-x-1`
                    : 'bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_#000000]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 stroke-[2.5px]" />
                  <span>{tab.label}</span>
                </div>
                {!!tab.badge && tab.badge > 0 && (
                  <span className="bg-black text-white text-[10px] px-2 py-0.5 border border-black font-extrabold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Visible on < lg screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffe600] border-t-4 border-black px-2 py-2 shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.isPrimary) {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex flex-col items-center justify-center -mt-6 transition-transform active:scale-95"
                >
                  <div className="w-13 h-13 bg-[#ff007f] text-white border-3 border-black p-2 shadow-[3px_3px_0px_0px_#000000]">
                    <PlusCircle className="w-7 h-7 stroke-[3px]" />
                  </div>
                  <span className="text-[10px] font-black text-black uppercase mt-1">Add (+)</span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center px-3 py-1.5 border-2 border-black transition-all ${
                  isActive
                    ? 'bg-black text-[#ffe600] shadow-[2px_2px_0px_0px_#000000] font-black'
                    : 'bg-white text-black hover:bg-gray-100 font-bold'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5px]" />
                <span className="text-[9px] uppercase mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
