import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { useFetchConversations } from '@/hooks/chat/queries';
import { useCreateConversationMutation } from '@/hooks/chat/mutations';
import { useSearchUsers } from '@/hooks/chat/queries';
import type { IConversation, IUser } from '@dto';
import { APIManager } from '@/services/APIManager';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

// Shadcn UI Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface SidebarProps {
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeConversationId,
  setActiveConversationId,
}) => {
  const { user, logout, updateProfile, isMockMode } = useAuth();
  const { socket } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const { data: conversations = [], refetch } = useFetchConversations();
  const createConversationMutation = useCreateConversationMutation();

  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'group'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // Create Chat Form States
  const [chatType, setChatType] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [groupName, setGroupName] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { data: searchResults = [] } = useSearchUsers(userSearchQuery);

  // Poll conversations for updates in mock mode when custom events trigger
  useEffect(() => {
    const handleMockMsg = () => {
      refetch();
    };
    window.addEventListener('mock_message_received', handleMockMsg);
    return () => window.removeEventListener('mock_message_received', handleMockMsg);
  }, [refetch]);

  // Join socket rooms for all conversations so we receive global messages/notifications
  useEffect(() => {
    if (!socket || !conversations || conversations.length === 0) return;

    conversations.forEach((conv: IConversation) => {
      socket.emit('join_conversation', conv.id);
    });
  }, [conversations, socket]);

  // Handle Profile Status Change
  const handleStatusChange = async (status: 'ONLINE' | 'AWAY' | 'BUSY' | 'OFFLINE') => {
    const success = await updateProfile({ status });
    if (success) {
      toast.success(`Presence status updated to ${status.toLowerCase()}`);
    } else {
      toast.error('Failed to update presence status.');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully.');
  };

  // Handle New Conversation Submission
  const handleCreateChat = async () => {
    if (chatType === 'GROUP' && !groupName.trim()) return;
    if (selectedUserIds.length === 0) return;

    try {
      const newConv = await createConversationMutation.mutateAsync({
        type: chatType,
        name: chatType === 'GROUP' ? groupName : undefined,
        memberIds: selectedUserIds,
      });
      if (newConv && newConv.id) {
        setActiveConversationId(newConv.id);
        toast.success('Conversation started successfully!');
      }
      // Reset form
      setIsNewChatOpen(false);
      setGroupName('');
      setSelectedUserIds([]);
      setUserSearchQuery('');
    } catch (err) {
      console.error('Failed to create conversation', err);
      toast.error('Failed to start conversation.');
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c: IConversation) => {
    // Tab filter
    if (activeTab === 'direct' && c.type !== 'DIRECT') return false;
    if (activeTab === 'group' && c.type !== 'GROUP') return false;

    // Search query filter
    if (!searchQuery) return true;
    const name = c.type === 'GROUP'
      ? c.name
      : c.members?.find((m) => m.id !== user?.id)?.username;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleSelectUser = (userId: string) => {
    if (chatType === 'DIRECT') {
      setSelectedUserIds([userId]);
    } else {
      setSelectedUserIds((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-emerald-500';
      case 'AWAY': return 'bg-amber-500';
      case 'BUSY': return 'bg-red-500';
      default: return 'bg-neutral-500';
    }
  };

  return (
    <div className="w-[340px] border-r border-border bg-card flex flex-col h-full shrink-0">

      {/* 1. Header Profile & Status */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/40 p-1.5 pr-3 rounded-2xl transition">
              <div className="relative">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(user?.status)}`} />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold text-foreground">{user?.username}</span>
                <span className="text-[10px] text-muted-foreground font-sans tracking-wide">
                  {user?.status || 'ONLINE'}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Set Presence</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusChange('ONLINE')}>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" /> Online
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusChange('AWAY')}>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2" /> Away
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusChange('BUSY')}>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2" /> Do Not Disturb
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusChange('OFFLINE')}>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-500 mr-2" /> Invisible
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2" aria-hidden="true" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" aria-hidden="true" /> Dark Mode
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Demo Badge */}
        {isMockMode ? (
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] py-0.5 px-2 hover:bg-primary/10">
            Demo Mode
          </Badge>
        ) : null}
      </div>

      {/* 2. Search & Add Chat */}
      <div className="p-4 flex items-center gap-2">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
          <Input
            type="text"
            placeholder="Search messages or users…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 rounded-xl"
          />
        </div>
        <Button
          onClick={() => setIsNewChatOpen(true)}
          className="w-9 h-9 p-0 rounded-xl shrink-0"
          aria-label="Start new conversation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Button>
      </div>

      {/* 3. Filter Tabs */}
      <div className="px-4 pb-2">
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted p-1 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs py-1 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">All</TabsTrigger>
            <TabsTrigger value="direct" className="rounded-lg text-xs py-1 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">Direct</TabsTrigger>
            <TabsTrigger value="group" className="rounded-lg text-xs py-1 data-[state=active]:bg-background data-[state=active]:text-foreground text-muted-foreground">Groups</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 4. Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id;

            // Get recipient details for DMs
            const recipient = conv.type === 'DIRECT'
              ? conv.members?.find((m) => m.id !== user?.id)
              : null;
            const chatName = conv.type === 'GROUP'
              ? conv.name
              : recipient?.username || 'Direct Message';
            const avatarUrl = conv.type === 'GROUP'
              ? conv.avatarUrl
              : recipient?.avatarUrl;

            const lastMsgContent = conv.lastMessage
              ? conv.lastMessage.sender.id === user?.id
                ? `You: ${conv.lastMessage.content}`
                : conv.lastMessage.content
              : 'No messages yet';

            const timeStr = conv.lastMessage
              ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  // Mark as read in mock mode
                  if (conv.unreadCount && conv.unreadCount > 0) {
                    APIManager.patch(`/conversations/${conv.id}/read`);
                    refetch();
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition select-none ${isSelected
                  ? 'bg-muted/80 border border-border/40'
                  : 'hover:bg-muted/30 border border-transparent'
                  }`}
              >
                {/* Avatar Presence */}
                <div className="relative shrink-0">
                  <Avatar className="w-11 h-11 border border-border">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {chatName?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conv.type === 'DIRECT' && recipient ? (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(recipient.status)}`} />
                  ) : null}
                </div>

                {/* Message info */}
                <div className="flex-1 min-w-0 flex flex-col text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground truncate">{chatName}</span>
                    <span className="text-[10px] text-muted-foreground font-sans shrink-0">{timeStr}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate pr-2">{lastMsgContent}</p>
                    {conv.unreadCount && conv.unreadCount > 0 ? (
                      <Badge className="bg-primary text-primary-foreground rounded-full text-[10px] h-4 min-w-4 px-1 flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ==========================================
          NEW CHAT DIALOG
          ========================================== */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>

          {/* Toggle Type */}
          <div className="grid grid-cols-2 bg-muted p-1 rounded-xl mb-4">
            <Button
              variant="ghost"
              onClick={() => { setChatType('DIRECT'); setSelectedUserIds([]); }}
              className={`py-1 h-auto text-xs font-semibold rounded-lg transition ${chatType === 'DIRECT' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Direct Message
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setChatType('GROUP'); setSelectedUserIds([]); }}
              className={`py-1 h-auto text-xs font-semibold rounded-lg transition ${chatType === 'GROUP' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Group Chat
            </Button>
          </div>

          {/* Group Name input if type GROUP */}
          {chatType === 'GROUP' ? (
            <div className="space-y-1 mb-4">
              <label htmlFor="groupName" className="text-xs text-muted-foreground block pl-1">Group Name</label>
              <Input
                id="groupName"
                name="groupName"
                type="text"
                placeholder="Enter group name…"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-9 rounded-xl"
              />
            </div>
          ) : null}

          {/* Search Users */}
          <div className="space-y-1 mb-4">
            <label htmlFor="searchContacts" className="text-xs text-muted-foreground block pl-1">Search Contacts</label>
            <Input
              id="searchContacts"
              name="searchContacts"
              type="text"
              placeholder="Search by username or email…"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="h-9 rounded-xl"
            />
          </div>

          {/* Users List */}
          <div className="max-h-48 overflow-y-auto space-y-1 mb-6 border border-border rounded-2xl p-2 bg-muted/20">
            {(() => {
              const displayUsers = searchResults.filter((u: IUser) => u.id !== user?.id);

              if (displayUsers.length === 0) {
                return (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    {userSearchQuery.trim().length > 0 ? "No users found" : "No other users available"}
                  </div>
                );
              }

              return displayUsers.map((u: IUser) => {
                const isSelected = selectedUserIds.includes(u.id);
                return (
                  <div
                    key={u.id}
                    onClick={() => toggleSelectUser(u.id)}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition ${isSelected ? 'bg-secondary' : 'hover:bg-muted'
                      }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback>{u.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-semibold">{u.username}</p>
                      <p className="text-[10px] truncate">{u.email}</p>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-2.5 h-2.5 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreateChat}
              disabled={selectedUserIds.length === 0 || (chatType === 'GROUP' && !groupName.trim())}
              className="h-11 w-full"
            >
              Create Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
