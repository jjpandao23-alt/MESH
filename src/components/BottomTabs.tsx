import React from 'react';
import { MessageSquare, Compass, PlusCircle, Activity, User } from 'lucide-react';

export type TabType = 'messages' | 'radar' | 'broadcast' | 'activity' | 'profile';

interface BottomTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, onTabChange, unreadCount = 0 }) => {
  const tabs = [
    { id: 'messages' as TabType, label: 'Chats', icon: MessageSquare, badge: unreadCount },
    { id: 'radar' as TabType, label: 'Search', icon: Compass },
    { id: 'broadcast' as TabType, label: 'Add (+)', icon: PlusCircle, isPrimary: true },
    { id: 'activity' as TabType, label: 'Activity', icon: Activity },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0e14]/95 backdrop-blur-lg border-t border-white/10 px-2 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center p-1 -mt-4 transition-transform active:scale-95"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] shadow-lg shadow-pink-500/20">
                  <div className="w-full h-full bg-[#0b0e14] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-400 mt-1">{tab.label}</span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-pink-400' : 'stroke-[1.75px]'}`} />
                {!!tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-pink-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-md">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'text-pink-400 font-semibold' : 'text-gray-400'}`}>
                {tab.label}
              </span>

              {isActive && <div className="w-1 h-1 rounded-full bg-pink-500 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
