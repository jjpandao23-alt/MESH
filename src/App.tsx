import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomTabs, TabType } from './components/BottomTabs';
import { DirectMessagesScreen } from './screens/DirectMessagesScreen';
import { ChatScreen } from './screens/ChatScreen';
import { RadarScreen } from './screens/RadarScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BroadcastScreen } from './screens/BroadcastScreen';
import { User } from './db/schema';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [selectedPeer, setSelectedPeer] = useState<User | null>(null);

  const handleSelectPeer = (peer: User) => {
    setSelectedPeer(peer);
  };

  const handleBackToMessages = () => {
    setSelectedPeer(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-gray-100 flex flex-col selection:bg-pink-500 selection:text-white">
      {/* If inside active chat with a peer, render full Chat Screen */}
      {selectedPeer ? (
        <ChatScreen peer={selectedPeer} onBack={handleBackToMessages} />
      ) : (
        <>
          {/* Top Instagram-Themed Header */}
          <Header />

          {/* Tab Screens Viewport */}
          <main className="flex-1">
            {activeTab === 'messages' && <DirectMessagesScreen onSelectPeer={handleSelectPeer} />}
            {activeTab === 'radar' && <RadarScreen onSelectPeer={handleSelectPeer} />}
            {activeTab === 'broadcast' && <BroadcastScreen onClose={() => setActiveTab('messages')} />}
            {activeTab === 'activity' && <ActivityScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </main>

          {/* Instagram 5-Tab Bottom Navigation Bar */}
          <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </div>
  );
}
export default App;
