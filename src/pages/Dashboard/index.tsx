import React, { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Sidebar } from '@/containers/Dashboard/Sidebar';
import { ChatWindow } from '@/containers/Dashboard/ChatWindow';
import { ChatInfo } from '@/containers/Dashboard/ChatInfo';
import { useFetchConversations } from '@/hooks/chat/queries';

export const Dashboard: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  const { data: conversations = [] } = useFetchConversations();
  const currentConversation = conversations.find(c => c.id === activeConversationId) || null;

  return (
    <DashboardLayout>
      <div className="flex w-full h-full bg-muted/20 p-2 lg:p-3 gap-2 lg:gap-3">
        {/* 1. Left Sidebar */}
        <div className="h-full rounded-2xl overflow-hidden ring-1 ring-border shadow-sm flex flex-col shrink-0 bg-card transition-all duration-300">
          <Sidebar
            activeConversationId={activeConversationId}
            setActiveConversationId={(id) => {
              setActiveConversationId(id);
              // Auto close info panel on chat change to keep layout clean
              setShowInfo(false);
            }}
          />
        </div>

        {/* 2. Chat Feed Area */}
        <div className="h-full flex-1 rounded-2xl overflow-hidden ring-1 ring-border shadow-md flex flex-col min-w-0 bg-background transition-all duration-300 relative z-10">
          <ChatWindow
            conversationId={activeConversationId}
            onToggleInfo={() => setShowInfo(!showInfo)}
          />
        </div>

        {/* 3. Details Panel */}
        {showInfo && currentConversation && (
          <div className="h-full rounded-2xl overflow-hidden ring-1 ring-border shadow-sm flex flex-col shrink-0 bg-card animate-in slide-in-from-right-8 fade-in duration-300">
            <ChatInfo
              conversation={currentConversation}
              onClose={() => setShowInfo(false)}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
