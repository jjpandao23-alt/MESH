import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomTabs, TabType } from './components/BottomTabs';
import { DirectMessagesScreen } from './screens/DirectMessagesScreen';
import { ChatScreen } from './screens/ChatScreen';
import { RadarScreen } from './screens/RadarScreen';
import { ActivityScreen } from './screens/ActivityScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BroadcastScreen } from './screens/BroadcastScreen';
import { User } from './db/schema';
import { peerDiscoveryService } from './mesh/PeerDiscoveryService';
import { db } from './db/storage';
import { Radio, MessageSquare } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [selectedPeer, setSelectedPeer] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(db.getUsers());

  useEffect(() => {
    peerDiscoveryService.startAutoDiscoveryBeacon();
    const unsub = db.subscribe(() => setUsers(db.getUsers()));
    return () => {
      peerDiscoveryService.stopAutoDiscoveryBeacon();
      unsub();
    };
  }, []);

  // Default select first peer on desktop if none selected
  useEffect(() => {
    if (!selectedPeer && users.length > 0) {
      setSelectedPeer(users[0]);
    }
  }, [users]);

  const handleSelectPeer = (peer: User) => {
    setSelectedPeer(peer);
  };

  const handleBackToMessages = () => {
    setSelectedPeer(null);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col font-sans selection:bg-[#ff007f] selection:text-white">
      {/* Neo-Brutalism Header */}
      <Header />

      {/* Main Responsive Body Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Desktop Sidebar Navigation */}
        <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Center Screen Viewport */}
        <main className="flex-1 min-w-0 p-2 md:p-4 overflow-y-auto">
          {/* Mobile view: full screen view toggle */}
          <div className="block lg:hidden">
            {selectedPeer ? (
              <ChatScreen peer={selectedPeer} onBack={handleBackToMessages} />
            ) : (
              <>
                {activeTab === 'messages' && <DirectMessagesScreen onSelectPeer={handleSelectPeer} />}
                {activeTab === 'radar' && <RadarScreen onSelectPeer={handleSelectPeer} />}
                {activeTab === 'broadcast' && <BroadcastScreen onClose={() => setActiveTab('messages')} />}
                {activeTab === 'activity' && <ActivityScreen />}
                {activeTab === 'profile' && <ProfileScreen />}
              </>
            )}
          </div>

          {/* Desktop Multi-Column Split View */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 h-[calc(100vh-80px)]">
            {/* Center Main Tab Pane (7 Columns) */}
            <div className="lg:col-span-6 xl:col-span-5 overflow-y-auto pr-1">
              {activeTab === 'messages' && <DirectMessagesScreen onSelectPeer={handleSelectPeer} selectedPeerId={selectedPeer?.id} />}
              {activeTab === 'radar' && <RadarScreen onSelectPeer={handleSelectPeer} />}
              {activeTab === 'broadcast' && <BroadcastScreen onClose={() => setActiveTab('messages')} />}
              {activeTab === 'activity' && <ActivityScreen />}
              {activeTab === 'profile' && <ProfileScreen />}
            </div>

            {/* Right Desktop Embedded Chat Pane (5/6 Columns) */}
            <div className="lg:col-span-6 xl:col-span-7 h-full">
              {selectedPeer ? (
                <ChatScreen peer={selectedPeer} isEmbedded={true} />
              ) : (
                <div className="h-full bg-[#1a1a1a] border-4 border-black p-8 flex flex-col items-center justify-center text-center shadow-[8px_8px_0px_0px_#ffe600]">
                  <div className="w-16 h-16 bg-[#ffe600] text-black border-3 border-black p-3 shadow-[4px_4px_0px_0px_#ff007f] mb-4 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 stroke-[3px]" />
                  </div>
                  <h3 className="text-base font-black uppercase text-white">Select a Mesh Peer</h3>
                  <p className="text-xs font-bold text-gray-400 max-w-xs mt-1">
                    Pick any active device or multi-hop node from the list to start off-grid chatting.
                  </p>
                  <div className="mt-4 inline-flex items-center space-x-2 bg-[#00ff66] text-black px-3 py-1.5 border-2 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000]">
                    <Radio className="w-4 h-4 stroke-[3px]" />
                    <span>Multi-Hop BLE Engine Ready</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
export default App;
