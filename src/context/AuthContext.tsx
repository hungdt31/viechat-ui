import React, { createContext, useContext, useState, useEffect } from 'react';
import type { IUser, AuthenticationRequest, RegisterRequest } from '@dto';
import { APIManager } from '@/services/APIManager';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  login: (credentials: AuthenticationRequest) => Promise<boolean>;
  register: (credentials: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<IUser>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState<boolean>(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        try {
          // Attempt to retrieve profile from live api or mock
          const res = await APIManager.get<IUser>('/users/me');
          if (res.success && res.data) {
            setUser(res.data);
          } else {
            // Clear if malformed
            handleLocalLogout();
          }
        } catch (err) {
          console.error('AuthContext: Failed to fetch profile on init. Keeping local state.', err);
          // If we had stored user, fallback keep it for offline mock support
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            handleLocalLogout();
          }
        }
      }
      setIsMockMode(APIManager.getMockState());
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const handleLocalLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const login = async (credentials: AuthenticationRequest): Promise<boolean> => {
    try {
      const res = await APIManager.post<any>('/auth/login', credentials);
      if (res.success && res.data) {
        // Resolve token from accessToken (live) or token (mock)
        const token = res.data.accessToken || res.data.token;
        if (!token) {
          return false;
        }

        setToken(token);
        localStorage.setItem('token', token);

        // Resolve user profile. If live mode, fetch from '/users/me'. If mock mode, use res.data.user.
        let userProfile = res.data.user;
        if (!userProfile) {
          try {
            const profileRes = await APIManager.get<IUser>('/users/me');
            if (profileRes.success && profileRes.data) {
              userProfile = profileRes.data;
            }
          } catch (profileErr) {
            console.error('AuthContext: Failed to fetch profile after login', profileErr);
          }
        }

        if (userProfile) {
          setUser(userProfile);
          localStorage.setItem('user', JSON.stringify(userProfile));
        }

        setIsMockMode(APIManager.getMockState());
        return true;
      }
    } catch (err) {
      console.error('AuthContext: Login failed', err);
    }
    return false;
  };

  const register = async (credentials: RegisterRequest): Promise<boolean> => {
    try {
      const res = await APIManager.post<any>('/auth/register', credentials);
      if (res.success && res.data) {
        // Mock mode has res.data.token & res.data.user
        // Live mode returns the user object directly
        const token = res.data.token;
        const registeredUser = res.data.user || res.data;

        if (token) {
          setToken(token);
          localStorage.setItem('token', token);
        }
        if (registeredUser) {
          setUser(registeredUser);
          localStorage.setItem('user', JSON.stringify(registeredUser));
        }

        setIsMockMode(APIManager.getMockState());
        return true;
      }
    } catch (err) {
      console.error('AuthContext: Registration failed', err);
    }
    return false;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await APIManager.post('/auth/logout');
    } catch (err) {
      console.warn('AuthContext: Logout request failed. Clearing locally anyway.', err);
    } finally {
      handleLocalLogout();
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<IUser>): Promise<boolean> => {
    try {
      const res = await APIManager.patch<IUser>('/users/me', profileData);
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        return true;
      }
    } catch (err) {
      console.error('AuthContext: Failed to update profile', err);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isMockMode,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
