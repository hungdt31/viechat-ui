import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { IUser, IConversation, IMessage, ApiResponse } from '@dto';

const BASE_URL = 'http://localhost:8080';

// Axios Instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Authorization Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to force/use mock fallback
let isMockActive = false;

// Determine if we should fall back to mock
const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    await axios.get(`${BASE_URL}/actuator/health`, { timeout: 1000 });
    isMockActive = false;
    console.log('API Client: Connected to Live Backend.');
    return true;
  } catch (err) {
    isMockActive = true;
    console.warn('API Client: Live Backend unreachable. Falling back to Mock Mode.');
    return false;
  }
};

// Initial connection check
checkBackendAvailability();

// ==========================================
// MOCK DATA LAYER (Local Storage State)
// ==========================================

export const MOCK_USERS: IUser[] = [
  { id: 'usr-1', username: 'alice', email: 'alice@viechat.com', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'ONLINE', roles: ['USER'] },
  { id: 'usr-2', username: 'bob', email: 'bob@viechat.com', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', status: 'AWAY', roles: ['USER'] },
  { id: 'usr-3', username: 'charlie', email: 'charlie@viechat.com', avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150', status: 'ONLINE', roles: ['USER'] },
  { id: 'usr-4', username: 'david', email: 'david@viechat.com', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', status: 'OFFLINE', roles: ['USER'] },
];

const seedMockDb = () => {
  if (!localStorage.getItem('viechat_seeded')) {
    localStorage.setItem('viechat_users', JSON.stringify(MOCK_USERS));
    
    // Seed some initial chats
    const conversations: IConversation[] = [
      {
        id: 'conv-1',
        type: 'DIRECT',
        members: [MOCK_USERS[0]],
        lastMessage: {
          id: 'msg-1',
          conversationId: 'conv-1',
          sender: MOCK_USERS[0],
          content: 'Hi! Welcome to VieChat. How is the frontend coming along? 😊',
          type: 'TEXT',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        unreadCount: 1,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'conv-2',
        type: 'DIRECT',
        members: [MOCK_USERS[1]],
        lastMessage: {
          id: 'msg-2',
          conversationId: 'conv-2',
          sender: MOCK_USERS[1],
          content: 'Hey, I uploaded the UI guidelines file. Check it out!',
          type: 'TEXT',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 90000000).toISOString()
      },
      {
        id: 'conv-3',
        name: 'VieChat Development Team',
        type: 'GROUP',
        members: [MOCK_USERS[0], MOCK_USERS[2]],
        lastMessage: {
          id: 'msg-3',
          conversationId: 'conv-3',
          sender: MOCK_USERS[2],
          content: 'Vite and Tailwind v4 setup is working perfectly!',
          type: 'TEXT',
          createdAt: new Date(Date.now() - 120000).toISOString()
        },
        unreadCount: 0,
        createdAt: new Date(Date.now() - 500000).toISOString()
      }
    ];
    
    const messages: Record<string, IMessage[]> = {
      'conv-1': [
        { id: 'msg-0', conversationId: 'conv-1', sender: { id: 'me', username: 'current_user', email: 'me@viechat.com' }, content: 'Hello Alice!', type: 'TEXT', createdAt: new Date(Date.now() - 4000000).toISOString() },
        { id: 'msg-1', conversationId: 'conv-1', sender: MOCK_USERS[0], content: 'Hi! Welcome to VieChat. How is the frontend coming along? 😊', type: 'TEXT', createdAt: new Date(Date.now() - 3600000).toISOString() }
      ],
      'conv-2': [
        { id: 'msg-2', conversationId: 'conv-2', sender: MOCK_USERS[1], content: 'Hey, I uploaded the UI guidelines file. Check it out!', type: 'TEXT', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ],
      'conv-3': [
        { id: 'msg-dev-1', conversationId: 'conv-3', sender: MOCK_USERS[0], content: 'Let\'s kick off the frontend implementation.', type: 'TEXT', createdAt: new Date(Date.now() - 300000).toISOString() },
        { id: 'msg-3', conversationId: 'conv-3', sender: MOCK_USERS[2], content: 'Vite and Tailwind v4 setup is working perfectly!', type: 'TEXT', createdAt: new Date(Date.now() - 120000).toISOString() }
      ]
    };
    
    localStorage.setItem('viechat_conversations', JSON.stringify(conversations));
    localStorage.setItem('viechat_messages', JSON.stringify(messages));
    localStorage.setItem('viechat_seeded', 'true');
  }
};

seedMockDb();

// Helper to get current user from localStorage
const getMe = (): IUser => {
  const userJson = localStorage.getItem('user');
  if (userJson) return JSON.parse(userJson);
  return { id: 'usr-me', username: 'Developer', email: 'dev@viechat.com', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', status: 'ONLINE', roles: ['USER'] };
};

// Auto replies simulations
const SIMULATED_REPLIES = [
  "Wow! That sounds amazing.",
  "Let me check it and get back to you.",
  "I completely agree with that approach.",
  "Can we jump on a call to review?",
  "Perfect, let's proceed with this implementation! 👍",
  "Nice work, thanks for updates!"
];

const triggerMockAutoReply = (convId: string, senderName: string) => {
  setTimeout(() => {
    const messagesStr = localStorage.getItem('viechat_messages');
    if (!messagesStr) return;
    const messages = JSON.parse(messagesStr) as Record<string, IMessage[]>;
    
    const conversationsStr = localStorage.getItem('viechat_conversations');
    if (!conversationsStr) return;
    const conversations = JSON.parse(conversationsStr) as IConversation[];
    
    const conversation = conversations.find(c => c.id === convId);
    if (!conversation) return;
    
    // Choose reply sender
    let replier = MOCK_USERS.find(u => u.username === senderName);
    if (!replier && conversation.members && conversation.members.length > 0) {
      replier = conversation.members[Math.floor(Math.random() * conversation.members.length)];
    }
    if (!replier) replier = MOCK_USERS[0];
    
    const randomContent = SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)];
    const newMsg: IMessage = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      sender: replier,
      content: randomContent,
      type: 'TEXT',
      createdAt: new Date().toISOString()
    };
    
    if (!messages[convId]) messages[convId] = [];
    messages[convId].push(newMsg);
    
    conversation.lastMessage = newMsg;
    if (window.location.pathname.indexOf(convId) === -1) {
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }
    
    localStorage.setItem('viechat_messages', JSON.stringify(messages));
    localStorage.setItem('viechat_conversations', JSON.stringify(conversations));
    
    // Dispatch custom event to notify components listening in real-time
    window.dispatchEvent(new CustomEvent('mock_message_received', { detail: newMsg }));
  }, 2000);
};

// ==========================================
// APIManager IMPLEMENTATION
// ==========================================

export class APIManager {
  
  static getMockState() {
    return isMockActive;
  }
  
  static forceMock(active: boolean) {
    isMockActive = active;
  }

  // GET Requests
  static async get<T>(url: string): Promise<ApiResponse<T>> {
    await checkBackendAvailability();
    
    if (isMockActive) {
      return this.handleMockGet<T>(url);
    }
    
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url);
      const resData = response.data as any;
      if (resData && typeof resData === 'object' && !('success' in resData)) {
        resData.success = resData.code === 1000 || (response.status >= 200 && response.status < 300);
      }
      return resData;
    } catch (error: any) {
      console.error(`APIManager GET failed: ${url}`, error);
      // Fallback if live call failed on network error
      if (!error.response) {
        isMockActive = true;
        return this.handleMockGet<T>(url);
      }
      throw error;
    }
  }

  // POST Requests
  static async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    await checkBackendAvailability();
    
    if (isMockActive) {
      return this.handleMockPost<T>(url, data);
    }
    
    try {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data);
      const resData = response.data as any;
      if (resData && typeof resData === 'object' && !('success' in resData)) {
        resData.success = resData.code === 1000 || (response.status >= 200 && response.status < 300);
      }
      return resData;
    } catch (error: any) {
      console.error(`APIManager POST failed: ${url}`, error);
      if (!error.response) {
        isMockActive = true;
        return this.handleMockPost<T>(url, data);
      }
      throw error;
    }
  }

  // PATCH Requests
  static async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    await checkBackendAvailability();
    
    if (isMockActive) {
      return this.handleMockPut<T>(url, data);
    }
    
    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data);
      const resData = response.data as any;
      if (resData && typeof resData === 'object' && !('success' in resData)) {
        resData.success = resData.code === 1000 || (response.status >= 200 && response.status < 300);
      }
      return resData;
    } catch (error: any) {
      console.error(`APIManager PUT failed: ${url}`, error);
      if (!error.response) {
        isMockActive = true;
        return this.handleMockPut<T>(url, data);
      }
      throw error;
    }
  }

  // DELETE Requests
  static async delete<T>(url: string): Promise<ApiResponse<T>> {
    await checkBackendAvailability();
    
    if (isMockActive) {
      return this.handleMockDelete<T>(url);
    }
    
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url);
      const resData = response.data as any;
      if (resData && typeof resData === 'object' && !('success' in resData)) {
        resData.success = resData.code === 1000 || (response.status >= 200 && response.status < 300);
      }
      return resData;
    } catch (error: any) {
      console.error(`APIManager DELETE failed: ${url}`, error);
      if (!error.response) {
        isMockActive = true;
        return this.handleMockDelete<T>(url);
      }
      throw error;
    }
  }

  // ==========================================
  // MOCK ROUTING / CONTROLLERS
  // ==========================================

  private static handleMockGet<T>(url: string): ApiResponse<T> {
    const me = getMe();
    
    // GET /users/me
    if (url === '/users/me') {
      return { success: true, data: me as unknown as T };
    }
    
    // GET /conversations
    if (url === '/conversations') {
      const conversations = JSON.parse(localStorage.getItem('viechat_conversations') || '[]');
      return { success: true, data: conversations as unknown as T };
    }
    
    // GET /conversations/{id}/messages
    if (url.match(/^\/conversations\/[^/]+\/messages$/)) {
      const match = url.match(/^\/conversations\/([^/]+)\/messages$/);
      const convId = match ? match[1] : '';
      const allMessages = JSON.parse(localStorage.getItem('viechat_messages') || '{}');
      const messages = allMessages[convId] || [];
      return { success: true, data: messages as unknown as T };
    }
    
    // GET /users/search?keyword=...
    if (url.startsWith('/users/search')) {
      const searchParams = new URLSearchParams(url.split('?')[1]);
      const keyword = (searchParams.get('keyword') || '').toLowerCase();
      const users = JSON.parse(localStorage.getItem('viechat_users') || '[]');
      const filtered = users.filter((u: IUser) => 
        u.username.toLowerCase().includes(keyword) || 
        u.email.toLowerCase().includes(keyword)
      );
      return { success: true, data: filtered as unknown as T };
    }
    
    // Default Empty Data
    return { success: true, data: {} as T };
  }

  private static handleMockPost<T>(url: string, data: any): ApiResponse<T> {
    // POST /auth/login
    if (url === '/auth/login') {
      const username = data.username || 'developer';
      const user: IUser = {
        id: 'usr-me',
        username,
        email: `${username}@viechat.com`,
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
        status: 'ONLINE',
        roles: ['USER']
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'mock-jwt-token-123456');
      
      return { 
        success: true, 
        data: { token: 'mock-jwt-token-123456', user } as unknown as T 
      };
    }
    
    // POST /auth/register
    if (url === '/auth/register') {
      const username = data.username || 'new_user';
      const user: IUser = {
        id: `usr-${Date.now()}`,
        username,
        email: data.email || `${username}@viechat.com`,
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
        status: 'ONLINE',
        roles: ['USER']
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'mock-jwt-token-123456');
      
      return { 
        success: true, 
        data: { token: 'mock-jwt-token-123456', user } as unknown as T 
      };
    }
    
    // POST /auth/logout
    if (url === '/auth/logout') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return { success: true, data: {} as unknown as T };
    }
    
    // POST /conversations
    if (url === '/conversations') {
      const conversations = JSON.parse(localStorage.getItem('viechat_conversations') || '[]');
      
      const newConv: IConversation = {
        id: `conv-${Date.now()}`,
        type: data.type || 'DIRECT',
        name: data.name,
        members: data.memberIds ? MOCK_USERS.filter(u => data.memberIds.includes(u.id)) : [],
        unreadCount: 0,
        createdAt: new Date().toISOString()
      };
      
      conversations.unshift(newConv);
      localStorage.setItem('viechat_conversations', JSON.stringify(conversations));
      return { success: true, data: newConv as unknown as T };
    }
    
    // POST /conversations/{id}/messages
    if (url.match(/^\/conversations\/[^/]+\/messages$/)) {
      const match = url.match(/^\/conversations\/([^/]+)\/messages$/);
      const convId = match ? match[1] : '';
      
      const me = getMe();
      const newMsg: IMessage = {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        sender: me,
        content: data.content || '',
        type: data.type || 'TEXT',
        createdAt: new Date().toISOString(),
        likes: []
      };
      
      // Update message list
      const allMessages = JSON.parse(localStorage.getItem('viechat_messages') || '{}');
      if (!allMessages[convId]) allMessages[convId] = [];
      allMessages[convId].push(newMsg);
      localStorage.setItem('viechat_messages', JSON.stringify(allMessages));
      
      // Update lastMessage on conversation
      const conversations = JSON.parse(localStorage.getItem('viechat_conversations') || '[]');
      const conversation = conversations.find((c: any) => c.id === convId);
      if (conversation) {
        conversation.lastMessage = newMsg;
        // Shift it to the top
        const index = conversations.indexOf(conversation);
        conversations.splice(index, 1);
        conversations.unshift(conversation);
        localStorage.setItem('viechat_conversations', JSON.stringify(conversations));
      }
      
      // Trigger a simulated dynamic auto reply
      if (conversation) {
        const otherMember = conversation.members?.find((m: IUser) => m.id !== me.id);
        triggerMockAutoReply(convId, otherMember?.username || 'alice');
      }
      
      return { success: true, data: newMsg as unknown as T };
    }
    
    // POST /messages/{id}/likes
    if (url.match(/^\/messages\/[^/]+\/likes$/)) {
      const match = url.match(/^\/messages\/([^/]+)\/likes$/);
      const msgId = match ? match[1] : '';
      const me = getMe();
      
      const allMessages = JSON.parse(localStorage.getItem('viechat_messages') || '{}');
      let foundMsg: IMessage | null = null;
      
      Object.keys(allMessages).forEach(convId => {
        const messages: IMessage[] = allMessages[convId];
        const msg = messages.find(m => m.id === msgId);
        if (msg) {
          foundMsg = msg;
          if (!msg.likes) msg.likes = [];
          if (!msg.likes.includes(me.id)) {
            msg.likes.push(me.id);
          }
        }
      });
      
      if (foundMsg) {
        localStorage.setItem('viechat_messages', JSON.stringify(allMessages));
        return { success: true, data: foundMsg as unknown as T };
      }
    }
    
    return { success: true, data: {} as T };
  }

  private static handleMockPut<T>(url: string, data: any): ApiResponse<T> {
    // PUT /users/me
    if (url === '/users/me') {
      const me = getMe();
      const updated = { ...me, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return { success: true, data: updated as unknown as T };
    }
    
    // PUT /conversations/{id}/read
    if (url.match(/^\/conversations\/[^/]+\/read$/)) {
      const match = url.match(/^\/conversations\/([^/]+)\/read$/);
      const convId = match ? match[1] : '';
      const conversations = JSON.parse(localStorage.getItem('viechat_conversations') || '[]');
      const conversation = conversations.find((c: any) => c.id === convId);
      if (conversation) {
        conversation.unreadCount = 0;
        localStorage.setItem('viechat_conversations', JSON.stringify(conversations));
      }
      return { success: true, data: true as unknown as T };
    }
    
    // PUT /messages/{id}/pin
    if (url.match(/^\/messages\/[^/]+\/pin$/)) {
      const match = url.match(/^\/messages\/([^/]+)\/pin$/);
      const msgId = match ? match[1] : '';
      const allMessages = JSON.parse(localStorage.getItem('viechat_messages') || '{}');
      let foundMsg: IMessage | null = null;
      
      Object.keys(allMessages).forEach(convId => {
        const messages: IMessage[] = allMessages[convId];
        const msg = messages.find(m => m.id === msgId);
        if (msg) {
          foundMsg = msg;
          msg.isPinned = true;
        }
      });
      
      if (foundMsg) {
        localStorage.setItem('viechat_messages', JSON.stringify(allMessages));
        return { success: true, data: foundMsg as unknown as T };
      }
    }
    
    return { success: true, data: {} as T };
  }

  private static handleMockDelete<T>(url: string): ApiResponse<T> {
    // DELETE /messages/{id}/likes
    if (url.match(/^\/messages\/[^/]+\/likes$/)) {
      const match = url.match(/^\/messages\/([^/]+)\/likes$/);
      const msgId = match ? match[1] : '';
      const me = getMe();
      
      const allMessages = JSON.parse(localStorage.getItem('viechat_messages') || '{}');
      let foundMsg: IMessage | null = null;
      
      Object.keys(allMessages).forEach(convId => {
        const messages: IMessage[] = allMessages[convId];
        const msg = messages.find(m => m.id === msgId);
        if (msg) {
          foundMsg = msg;
          if (msg.likes) {
            msg.likes = msg.likes.filter(id => id !== me.id);
          }
        }
      });
      
      if (foundMsg) {
        localStorage.setItem('viechat_messages', JSON.stringify(allMessages));
        return { success: true, data: foundMsg as unknown as T };
      }
    }
    
    // DELETE /messages/{id}/pin
    if (url.match(/^\/messages\/[^/]+\/pin$/)) {
      const match = url.match(/^\/messages\/([^/]+)\/pin$/);
      const msgId = match ? match[1] : '';
      const allMessages = JSON.parse(localStorage.getItem('viechat_messages') || '{}');
      let foundMsg: IMessage | null = null;
      
      Object.keys(allMessages).forEach(convId => {
        const messages: IMessage[] = allMessages[convId];
        const msg = messages.find(m => m.id === msgId);
        if (msg) {
          foundMsg = msg;
          msg.isPinned = false;
        }
      });
      
      if (foundMsg) {
        localStorage.setItem('viechat_messages', JSON.stringify(allMessages));
        return { success: true, data: foundMsg as unknown as T };
      }
    }
    
    // DELETE /messages/{id} (Retract message)
    if (url.match(/^\/messages\/[^/]+$/)) {
      const match = url.match(/^\/messages\/([^/]+)$/);
      const msgId = match ? match[1] : '';
      const allMessages = JSON.parse(localStorage.getItem('viechat_messages') || '{}');
      let deleted = false;
      
      Object.keys(allMessages).forEach(convId => {
        const messages: IMessage[] = allMessages[convId];
        const index = messages.findIndex(m => m.id === msgId);
        if (index !== -1) {
          messages.splice(index, 1);
          deleted = true;
        }
      });
      
      if (deleted) {
        localStorage.setItem('viechat_messages', JSON.stringify(allMessages));
        return { success: true, data: true as unknown as T };
      }
    }
    
    return { success: true, data: {} as T };
  }
}
