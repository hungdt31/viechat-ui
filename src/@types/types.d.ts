declare module '@dto' {
  export interface IUser {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    status?: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'AWAY';
    lastActive?: string;
    roles?: string[];
    createdAt?: string;
  }

  export interface IConversation {
    id: string;
    name?: string;
    type: 'DIRECT' | 'GROUP';
    avatarUrl?: string;
    lastMessage?: IMessage;
    unreadCount?: number;
    members?: IUser[];
    createdAt?: string;
  }

  export interface IMessage {
    id: string;
    conversationId: string;
    sender: IUser;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE';
    status?: 'SENT' | 'DELIVERED' | 'READ';
    isPinned?: boolean;
    likes?: string[]; // userIds who liked the message
    createdAt: string;
  }

  export interface IGroup {
    id: string;
    name: string;
    avatarUrl?: string;
    members?: IUser[];
    creatorId?: string;
    createdAt?: string;
  }

  export interface AuthenticationRequest {
    username: string;
    password?: string;
  }

  export interface AuthenticationResponse {
    token: string;
    refreshToken?: string;
    user: IUser;
  }

  export interface RegisterRequest {
    username: string;
    email: string;
    password?: string;
  }

  export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    code?: number;
  }
}
