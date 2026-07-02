import React from 'react';
import type { IConversation, IUser } from '@dto';
import { useFetchMessages } from '@/hooks/chat/queries';

// Shadcn UI Imports
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChatInfoProps {
  conversation: IConversation | null;
  onClose: () => void;
}

export const ChatInfo: React.FC<ChatInfoProps> = ({ conversation, onClose }) => {
  const { data: messages = [] } = useFetchMessages(conversation?.id || '');

  if (!conversation) return null;

  // Filter pinned messages
  const pinnedMessages = messages.filter((m) => m.isPinned);

  // Filter shared attachments (images or files)
  const sharedMedia = messages.filter((m) => m.type === 'IMAGE' || m.type === 'FILE');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-emerald-500';
      case 'AWAY': return 'bg-amber-500';
      case 'BUSY': return 'bg-red-500';
      default: return 'bg-neutral-500';
    }
  };

  const recipient = conversation.type === 'DIRECT'
    ? conversation.members?.find((m) => m.id !== 'usr-me')
    : null;
  const chatName = conversation.type === 'GROUP'
    ? conversation.name
    : recipient?.username || 'Direct Message';
  const chatAvatar = conversation.type === 'GROUP'
    ? conversation.avatarUrl
    : recipient?.avatarUrl;

  return (
    <div className="w-[300px] border-l border-border bg-card flex flex-col h-full shrink-0 relative animate-in slide-in-from-right duration-200">

      {/* 1. Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4 shrink-0">
        <span className="text-sm font-semibold text-foreground">Details</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">

          {/* 2. Brand Card */}
          <div className="flex flex-col items-center text-center p-4 bg-muted/40 border border-border/60 rounded-2xl">
            <Avatar className="w-16 h-16 border border-border mb-3">
              <AvatarImage src={chatAvatar} />
              <AvatarFallback className="bg-muted text-muted-foreground text-lg font-semibold">
                {chatName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-sm font-semibold text-foreground">{chatName}</h3>
            <p className="text-[10px] text-muted-foreground mt-1 capitalize font-sans tracking-wide">
              {conversation.type.toLowerCase()} chat
            </p>
          </div>

          {/* 3. Members List (If Group Chat) */}
          {conversation.type === 'GROUP' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-muted-foreground">Members</span>
                <Badge className="bg-muted text-muted-foreground text-[9px] hover:bg-muted/60">
                  {conversation.members?.length || 0}
                </Badge>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {conversation.members?.map((m: IUser) => (
                  <div key={m.id} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-muted/40 transition">
                    <div className="relative shrink-0">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={m.avatarUrl} />
                        <AvatarFallback>{m.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-card ${getStatusColor(m.status)}`} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{m.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Pinned Messages */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground block px-1 text-left">Pinned Messages</span>
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-4 bg-muted/20 border border-border/40 rounded-2xl text-[10px] text-muted-foreground font-sans">
                No pinned messages
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {pinnedMessages.map((m) => (
                  <div key={m.id} className="p-2.5 bg-muted/30 border border-border/60 rounded-xl text-left text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">{m.sender.username}</span>
                      <span className="text-[9px] text-muted-foreground font-sans">
                        {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-muted-foreground font-sans line-clamp-2">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Shared Attachments */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground block px-1 text-left">Shared Files</span>
            {sharedMedia.length === 0 ? (
              <div className="text-center py-4 bg-muted/20 border border-border/40 rounded-2xl text-[10px] text-muted-foreground font-sans">
                No files shared yet
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {sharedMedia.map((m) => {
                  const isImage = m.type === 'IMAGE';
                  const title = isImage
                    ? 'Shared Photo'
                    : m.content.split(': ')[1]?.split(' (')[0] || 'Document';

                  return (
                    <div key={m.id} className="flex items-center gap-3 p-2 bg-muted/30 hover:bg-muted/60 border border-border/60 rounded-xl cursor-pointer transition">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {isImage ? '🖼️' : '📄'}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[11px] font-semibold text-foreground truncate">{title}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {m.sender.username} • {new Date(m.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </ScrollArea>
    </div>
  );
};
