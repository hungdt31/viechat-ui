import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IConversation, IMessage } from '@dto';
import { APIManager } from '@/services/APIManager';
import { QUERY_KEYS } from './queries';

// Send a message
export const useSendMessageMutation = (conversationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<IMessage, Error, { content: string; type?: 'TEXT' | 'IMAGE' | 'FILE' }>({
    mutationFn: async ({ content, type = 'TEXT' }) => {
      const res = await APIManager.post<IMessage>(`/conversations/${conversationId}/messages`, { 
        message_content: content, 
        message_type: type 
      });
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to send message');
    },
    onSuccess: (newMessage) => {
      // Optimistically append message to cache
      queryClient.setQueryData<IMessage[]>(QUERY_KEYS.messages(conversationId), (old = []) => {
        // Prevent duplicate if websocket already added it
        if (old.some(m => m.id === newMessage.id)) return old;
        return [...old, newMessage];
      });
      // Invalidate conversations list to update lastMessage
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
    },
  });
};

// Create a new direct or group conversation
export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<IConversation, Error, { type: 'DIRECT' | 'GROUP'; name?: string; memberIds: string[] }>({
    mutationFn: async (data: { type: 'DIRECT' | 'GROUP'; name?: string; memberIds: string[] }) => {
      if (data.type === 'DIRECT') {
        const res = await APIManager.post<IConversation>('/conversations', {
          targetUserId: data.memberIds[0]
        });
        if (!res.success) {
          throw new Error(res.message || 'Failed to create direct conversation');
        }
        return res.data;
      } else {
        const res = await APIManager.post<any>('/groups', {
          name: data.name,
          member_ids: data.memberIds,
          isPro: false
        });
        if (!res.success) {
          throw new Error(res.message || 'Failed to create group');
        }
        // Group creation automatically creates a General channel. Fetch it so we can set it as active.
        const channelsRes = await APIManager.get<IConversation[]>(`/groups/${res.data.id}/channels`);
        if (channelsRes.success && channelsRes.data && channelsRes.data.length > 0) {
          return channelsRes.data[0];
        }
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
    },
  });
};

// Toggle like / reaction on a message
export const useToggleReactionMutation = (conversationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<IMessage, Error, { messageId: string; liked: boolean }>({
    mutationFn: async ({ messageId, liked }) => {
      let res;
      if (liked) {
        // Delete like (unlike)
        res = await APIManager.delete<IMessage>(`/messages/${messageId}/likes`);
      } else {
        // Create like
        res = await APIManager.post<IMessage>(`/messages/${messageId}/likes`);
      }
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to toggle reaction');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(conversationId) });
    },
  });
};

// Toggle pin / unpin message
export const useTogglePinMutation = (conversationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<IMessage, Error, { messageId: string; pinned: boolean }>({
    mutationFn: async ({ messageId, pinned }) => {
      let res;
      if (pinned) {
        // Unpin
        res = await APIManager.delete<IMessage>(`/messages/${messageId}/pin`);
      } else {
        // Pin
        res = await APIManager.patch<IMessage>(`/messages/${messageId}/pin`);
      }
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.message || 'Failed to toggle pin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(conversationId) });
    },
  });
};

// Delete/Retract message
export const useDeleteMessageMutation = (conversationId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<boolean, Error, string>({
    mutationFn: async (messageId) => {
      const res = await APIManager.delete<boolean>(`/messages/${messageId}`);
      if (res.success) {
        return true;
      }
      throw new Error(res.message || 'Failed to delete message');
    },
    onSuccess: (_, messageId) => {
      // Filter out from local cache immediately
      queryClient.setQueryData<IMessage[]>(QUERY_KEYS.messages(conversationId), (old = []) => {
        return old.filter(m => m.id !== messageId);
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
    },
  });
};
