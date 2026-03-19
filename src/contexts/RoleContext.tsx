/**
 * RoleContext — ported from Secure Your Data, adapted for Express JWT backend.
 * MongoDB Mayhem is the primary UI; this provides role-based access (moderator/attendee).
 */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '@/services/api';

type UserRole = 'moderator' | 'attendee' | null;

interface AuthUser {
  handle: string;
  role: UserRole;
  sessionId?: string;
  sessionName?: string;
}

interface RoleContextType {
  role: UserRole;
  user: AuthUser | null;
  isModerator: boolean;
  isAttendee: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  /** Register as moderator with handle + password */
  registerModerator: (handle: string, password: string) => Promise<void>;
  /** Login with handle + password */
  login: (handle: string, password: string) => Promise<void>;
  /** Join a workshop session as attendee via PIN */
  joinSession: (pin: string, handle: string) => Promise<void>;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Try to validate token by fetching player profile
      api.players.me()
        .then((data: any) => {
          setUser({
            handle: data.handle || 'Agent',
            role: data.role || 'attendee',
            sessionId: data.sessionId,
          });
        })
        .catch(() => {
          // Token expired or invalid — clear it
          setAuthToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const role = user?.role ?? null;

  const registerModerator = useCallback(async (handle: string, password: string) => {
    const res = await api.auth.register(handle, password, 'moderator');
    setAuthToken(res.token);
    setUser({ handle: res.handle, role: res.role as UserRole });
  }, []);

  const login = useCallback(async (handle: string, password: string) => {
    const res = await api.auth.login(handle, password);
    setAuthToken(res.token);
    setUser({ handle: res.handle, role: res.role as UserRole });
  }, []);

  const joinSession = useCallback(async (pin: string, handle: string) => {
    const res = await api.auth.joinSession(pin, handle);
    setAuthToken(res.token);
    setUser({
      handle: res.handle,
      role: res.role as UserRole,
      sessionId: res.sessionId,
      sessionName: res.sessionName,
    });
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        user,
        isModerator: role === 'moderator',
        isAttendee: role === 'attendee',
        isAuthenticated: !!user,
        loading,
        registerModerator,
        login,
        joinSession,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
}
