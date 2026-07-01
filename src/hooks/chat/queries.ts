import { useQuery } from '@tanstack/react-query';
import type { IConversation, IMessage, IUser } from '@dto';
import { APIManager } from '../../services/APIManager';

export const QUERY_KEYS = {
  conversations: 'conversations',
  messages: (convId: string) => ['messages', convId],
  userSearch: (keyword: string) => ['userSearch', keyword],
};

// Fetch all conversations for current user
export const useFetchConversations = () => {
  return useQuery<IConversation[]>({
    queryKey: [QUERY_KEYS.conversations],
    queryFn: async () => {
      const res = await APIManager.get<IConversation[]>('/conversations');
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    refetchInterval: 10000, // Pull every 10 seconds in case websockets drop
  });
};

// Fetch messages for a specific conversation
export const useFetchMessages = (conversationId: string) => {
  return useQuery<IMessage[]>({
    queryKey: QUERY_KEYS.messages(conversationId),
    queryFn: async () => {
      const res = await APIManager.get<IMessage[]>(`/conversations/${conversationId}/messages`);
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // Cache messages for 5 mins
  });
};

// Search users by keyword
export const useSearchUsers = (keyword: string) => {
  return useQuery<IUser[]>({
    queryKey: QUERY_KEYS.userSearch(keyword),
    queryFn: async () => {
      const res = await APIManager.get<IUser[]>(`/users/search?keyword=${encodeURIComponent(keyword)}`);
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    enabled: keyword.trim().length > 0,
  });
};
