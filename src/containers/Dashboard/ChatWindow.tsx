import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useFetchMessages } from '../../hooks/chat/queries';
import {
  useSendMessageMutation,
  useToggleReactionMutation,
  useTogglePinMutation,
  useDeleteMessageMutation,
} from '../../hooks/chat/mutations';
import type { IMessage, IConversation } from '@dto';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../hooks/chat/queries';

// Shadcn UI Imports
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Smile, Image, FileText } from 'lucide-react';

interface ChatWindowProps {
  conversationId: string | null;
  onToggleInfo: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, onToggleInfo }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useFetchMessages(conversationId || '');
  const sendMessageMutation = useSendMessageMutation(conversationId || '');
  const toggleReactionMutation = useToggleReactionMutation(conversationId || '');
  const togglePinMutation = useTogglePinMutation(conversationId || '');
  const deleteMessageMutation = useDeleteMessageMutation(conversationId || '');

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [searchInChat, setSearchInChat] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Bind Socket Message Listener
  useEffect(() => {
    if (!conversationId) return;

    const handleIncomingMessage = (newMessage: IMessage) => {
      if (newMessage.conversationId === conversationId) {
        // Manually update the cache
        queryClient.setQueryData<IMessage[]>(QUERY_KEYS.messages(conversationId), (old = []) => {
          if (old.some((m) => m.id === newMessage.id)) return old;
          return [...old, newMessage];
        });
        
        // Refresh conversations to update sidebar snippets
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
      }
    };

    const handleTypingStatus = (data: { conversationId: string; username: string; typing: boolean }) => {
      if (data.conversationId === conversationId && data.username !== user?.username) {
        setTypingUser(data.username);
        setIsTyping(data.typing);
      }
    };

    socket.on('message:receive', handleIncomingMessage);
    socket.on('typing:update', handleTypingStatus);

    return () => {
      socket.off('message:receive', handleIncomingMessage);
      socket.off('typing:update', handleTypingStatus);
    };
  }, [conversationId, socket, queryClient, user?.username]);

  // Send Typing Indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);

    socket.emit('typing:start', { conversationId, username: user?.username });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId, username: user?.username });
    }, 2000);
  };

  // Send Message
  const handleSend = async () => {
    if (!inputVal.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({ content: inputVal, type: 'TEXT' });
      setInputVal('');
      socket.emit('typing:stop', { conversationId, username: user?.username });
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Simulate File/Image Upload
  const handleSendFileMock = async (type: 'IMAGE' | 'FILE') => {
    const mockContent = type === 'IMAGE'
      ? 'Uploaded an image: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'
      : 'Attachment: Project_Specification_v2.pdf (1.2 MB)';
      
    try {
      await sendMessageMutation.mutateAsync({ content: mockContent, type });
    } catch (err) {
      console.error('Failed to send attachment', err);
    }
  };

  // Toggle Reaction
  const handleToggleReaction = async (messageId: string, liked: boolean) => {
    try {
      await toggleReactionMutation.mutateAsync({ messageId, liked });
    } catch (err) {
      console.error('Failed to toggle reaction', err);
    }
  };

  // Toggle Pin
  const handleTogglePin = async (messageId: string, pinned: boolean) => {
    try {
      await togglePinMutation.mutateAsync({ messageId, pinned });
    } catch (err) {
      console.error('Failed to toggle pin', err);
    }
  };

  // Retract Message
  const handleRetract = async (messageId: string) => {
    try {
      await deleteMessageMutation.mutateAsync(messageId);
    } catch (err) {
      console.error('Failed to retract message', err);
    }
  };

  // Search filter
  const filteredMessages = messages.filter((m) => {
    if (!searchInChat) return true;
    return m.content.toLowerCase().includes(searchInChat.toLowerCase());
  });

  if (!conversationId) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center text-muted-foreground select-none">
        <div className="w-16 h-16 rounded-3xl bg-muted border border-border flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-muted-foreground">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-3.658A8.967 8.967 0 0 1 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-foreground">Your Messages</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">Select a conversation from the list to start chatting.</p>
      </div>
    );
  }

  // Get active conversation details
  const conversations = queryClient.getQueryData<IConversation[]>([QUERY_KEYS.conversations]) || [];
  const currentChat = conversations.find((c) => c.id === conversationId);
  const recipient = currentChat?.type === 'DIRECT' 
    ? currentChat.members?.find((m) => m.id !== user?.id) 
    : null;
  const chatName = currentChat?.type === 'GROUP' 
    ? currentChat.name 
    : recipient?.username || 'Chat Room';
  const chatAvatar = currentChat?.type === 'GROUP' 
    ? currentChat.avatarUrl 
    : recipient?.avatarUrl;

  const pinnedMessage = messages.find((m) => m.isPinned);

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden relative">
      
      {/* 1. Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-border">
            <AvatarImage src={chatAvatar} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {chatName?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-foreground">{chatName}</span>
            <span className="text-[10px] text-muted-foreground font-sans">
              {currentChat?.type === 'GROUP' 
                ? `${currentChat.members?.length || 0} participants` 
                : recipient?.status === 'ONLINE' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            onClick={() => setShowSearch(!showSearch)}
            className="w-8 h-8 p-0 rounded-xl"
            aria-label="Toggle search in chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            onClick={onToggleInfo}
            className="w-8 h-8 p-0 rounded-xl"
            aria-label="Toggle chat details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.852l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* 2. Pinned Banner */}
      {pinnedMessage ? (
        <div className="bg-muted/90 border-b border-border/60 p-3 flex items-center justify-between px-6 shrink-0 text-left text-xs z-10">
          <div className="flex items-center gap-2 pr-6 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15-6 6m0 0-6-6m6 6V9a6 6 0 0 1 12 0v3" />
            </svg>
            <div className="truncate">
              <span className="font-semibold text-foreground">Pinned message:</span>{' '}
              <span className="text-muted-foreground font-sans">{pinnedMessage.content}</span>
            </div>
          </div>
          <Button
            onClick={() => handleTogglePin(pinnedMessage.id, true)}
            className="text-[10px] text-muted-foreground hover:text-foreground p-0 h-auto bg-transparent hover:bg-transparent"
          >
            Unpin
          </Button>
        </div>
      ) : null}

      {/* 3. Search Bar inline */}
      {showSearch ? (
        <div className="p-2 border-b border-border bg-background/60 backdrop-blur-sm px-6 flex items-center shrink-0">
          <Input
            id="searchInChat"
            name="searchInChat"
            type="text"
            placeholder="Search messages in this conversation…"
            value={searchInChat}
            onChange={(e) => setSearchInChat(e.target.value)}
            className="h-8 text-xs rounded-xl"
          />
        </div>
      ) : null}

      {/* 4. Messages Scroller */}
      <TooltipProvider>
        <ScrollArea ref={scrollRef} className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10 text-xs text-muted-foreground">Loading messages…</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-10 text-xs text-muted-foreground">No messages yet</div>
            ) : (
              filteredMessages.map((msg: IMessage) => {
                const isMe = msg.sender.id === user?.id || msg.sender.id === 'me' || msg.sender.id === 'usr-me';
                const hasLikes = msg.likes && msg.likes.length > 0;
                const isLikedByMe = msg.likes?.includes(user?.id || 'usr-me');

                return (
                  <div key={msg.id} className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
                    {/* Sender Avatar */}
                    {!isMe && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={msg.sender.avatarUrl} />
                        <AvatarFallback>{msg.sender.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}

                    {/* Bubble box */}
                    <div className="flex flex-col max-w-[70%] text-left relative">
                      {/* Name label if group chat */}
                      {!isMe && currentChat?.type === 'GROUP' && (
                        <span className="text-[10px] text-neutral-500 mb-0.5 ml-1">{msg.sender.username}</span>
                      )}

                      {/* Content block */}
                      <div className={`p-3 rounded-2xl relative shadow-md ${
                        isMe 
                          ? 'bg-violet-600 text-white rounded-tr-none' 
                          : 'bg-neutral-800/80 text-neutral-200 rounded-tl-none border border-neutral-800'
                      }`}>
                        
                        {/* File/Image renders */}
                        {msg.type === 'IMAGE' && msg.content.startsWith('Uploaded an image:') ? (
                          <div className="space-y-2">
                            <img src={msg.content.split(': ')[1]} alt="Shared" className="rounded-xl max-w-full max-h-48 object-cover border border-neutral-700/20" />
                            <p className="text-xs font-sans">Image Attachment</p>
                          </div>
                        ) : msg.type === 'FILE' && msg.content.startsWith('Attachment:') ? (
                          <div className="flex items-center gap-3 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800 text-xs">
                            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-violet-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate text-neutral-300">{msg.content.split(': ')[1].split(' (')[0]}</p>
                              <p className="text-[10px] text-neutral-500">{msg.content.split(' (')[1]?.replace(')', '') || 'Unknown size'}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm font-sans break-words whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}

                        {/* Pinned label */}
                        {msg.isPinned && (
                          <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? 'text-violet-200' : 'text-neutral-500'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15-6 6m0 0-6-6m6 6V9a6 6 0 0 1 12 0v3" />
                            </svg>
                            Pinned
                          </div>
                        )}
                      </div>

                      {/* Reactions display */}
                      {hasLikes && (
                        <div className={`absolute bottom-[-10px] ${isMe ? 'left-2' : 'right-2'} bg-neutral-900 border border-neutral-800 rounded-full py-0.5 px-1.5 flex items-center gap-1 shadow-sm shrink-0 z-20`}>
                          <span className="text-[10px]">❤️</span>
                          {msg.likes && msg.likes.length > 1 && (
                            <span className="text-[9px] text-neutral-400 font-semibold">{msg.likes.length}</span>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className={`text-[9px] text-neutral-600 font-sans mt-1 ${isMe ? 'text-right' : 'text-left pl-1'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Hover controls menu */}
                    <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition self-center shrink-0 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {/* React/Like button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => handleToggleReaction(msg.id, !!isLikedByMe)}
                            className="w-7 h-7 p-0 text-neutral-500 hover:text-red-400 hover:bg-neutral-800/40 rounded-lg"
                          >
                            ❤️
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-900 border-neutral-800 text-[10px] py-1 text-white">Like Message</TooltipContent>
                      </Tooltip>

                      {/* Pin button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            onClick={() => handleTogglePin(msg.id, !!msg.isPinned)}
                            className="w-7 h-7 p-0 text-neutral-500 hover:text-violet-400 hover:bg-neutral-800/40 rounded-lg"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15-6 6m0 0-6-6m6 6V9a6 6 0 0 1 12 0v3" />
                            </svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-neutral-900 border-neutral-800 text-[10px] py-1 text-white">
                          {msg.isPinned ? 'Unpin' : 'Pin message'}
                        </TooltipContent>
                      </Tooltip>

                      {/* Retract/Delete message (only for my messages) */}
                      {isMe && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              onClick={() => handleRetract(msg.id)}
                              className="w-7 h-7 p-0 text-neutral-500 hover:text-red-500 hover:bg-neutral-800/40 rounded-lg"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-neutral-900 border-neutral-800 text-[10px] py-1 text-white">Retract Message</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Live Typing bubble */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-neutral-800 text-neutral-500 font-sans text-xs">
                    {typingUser.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="p-3 bg-neutral-800/40 text-neutral-400 rounded-2xl rounded-tl-none border border-neutral-800/40 shadow-sm flex items-center gap-1.5 shrink-0 max-w-[20%]">
                  <span className="text-[10px] font-sans font-medium">{typingUser} is typing</span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </TooltipProvider>

      {/* 5. Input Bar */}
      <div className="p-4 border-t border-border flex items-center gap-2 bg-background shrink-0">
        
        {/* Attachment menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-9 h-9 p-0 rounded-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="focus:bg-muted cursor-pointer" onClick={() => handleSendFileMock('IMAGE')}>
              <Image className="w-4 h-4 mr-2" aria-hidden="true" /> Share Image
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-muted cursor-pointer" onClick={() => handleSendFileMock('FILE')}>
              <FileText className="w-4 h-4 mr-2" aria-hidden="true" /> Share Document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Text Input */}
        <Input
          type="text"
          placeholder="Type your message…"
          value={inputVal}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-1 h-9 rounded-xl"
        />

        {/* Emoji insert quick panel */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-9 h-9 p-0 rounded-xl"
              aria-label="Insert emoji"
            >
              <Smile className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="grid grid-cols-5 gap-1 p-2 w-44">
            {['😀', '😂', '👍', '🔥', '🎉', '❤️', '🙌', '✨', '🤔', '🚀'].map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="icon"
                onClick={() => setInputVal(prev => prev + emoji)}
                className="w-8 h-8 hover:bg-muted rounded-lg text-lg"
              >
                {emoji}
              </Button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send arrow button */}
        <Button
          onClick={handleSend}
          disabled={!inputVal.trim()}
          className="w-9 h-9 p-0 rounded-xl shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </Button>
      </div>

    </div>
  );
};
