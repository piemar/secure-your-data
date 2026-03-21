/**
 * RoleContext — ported from Secure Your Data, adapted for Express JWT backend.
 * MongoDB Mayhem is the primary UI; this provides role-based access (moderator/attendee).
 */
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from '@/services/api';
import { syncLocalPlayerToServer } from '@/lib/player-sync';

type UserRole = 'moderator' | 'attendee' | null;

interface AuthUser {
  handle: string;
  role: UserRole;
  tenantId?: string;
  workshopId?: string;
  sessionId?: string;
  sessionName?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarId?: string;
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
  /** Join a workshop session as attendee via PIN/email domain */
  joinSession: (
    pin: string,
    handle: string,
    email: string,
    profile?: { firstName?: string; lastName?: string; avatarId?: string }
  ) => Promise<void>;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function isFalsyEnvFlag(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return ['0', 'false', 'no', 'off'].includes(value.trim().toLowerCase());
}

function canUseDevAutologin(): boolean {
  if (!import.meta.env.DEV) return false;
  if (isFalsyEnvFlag(import.meta.env.VITE_DEV_AUTOLOGIN)) return false;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

const DEV_AUTOLOGIN_HANDLE_KEY = 'mayhem-dev-autologin-handle';
const DEV_AUTOLOGIN_PASSWORD_KEY = 'mayhem-dev-autologin-password';

function loadOrCreateDevCredentials() {
  const envHandle = (import.meta.env.VITE_DEV_AUTOLOGIN_HANDLE || '').trim();
  const envPassword = (import.meta.env.VITE_DEV_AUTOLOGIN_PASSWORD || '').trim();
  if (envHandle && envPassword) {
    return { handle: envHandle, password: envPassword };
  }

  const cachedHandle = localStorage.getItem(DEV_AUTOLOGIN_HANDLE_KEY)?.trim();
  const cachedPassword = localStorage.getItem(DEV_AUTOLOGIN_PASSWORD_KEY)?.trim();
  if (cachedHandle && cachedPassword) {
    return { handle: cachedHandle, password: cachedPassword };
  }

  const generatedHandle = `dev_${Math.random().toString(36).slice(2, 10)}`;
  const generatedPassword = Math.random().toString(36).slice(2, 14);
  localStorage.setItem(DEV_AUTOLOGIN_HANDLE_KEY, generatedHandle);
  localStorage.setItem(DEV_AUTOLOGIN_PASSWORD_KEY, generatedPassword);
  return { handle: generatedHandle, password: generatedPassword };
}

function normalizeAuthUser(data: any): AuthUser {
  return {
    handle: data.handle || 'Agent',
    role: data.role || 'attendee',
    tenantId: data.tenantId || 'default',
    workshopId: data.workshopId,
    sessionId: data.sessionId || data.workshopId,
    email: typeof data.email === 'string' ? data.email : undefined,
    firstName: typeof data.firstName === 'string' ? data.firstName : undefined,
    lastName: typeof data.lastName === 'string' ? data.lastName : undefined,
    avatarId: typeof data.avatarId === 'string' ? data.avatarId : undefined,
  };
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from stored token on mount
  useEffect(() => {
    let alive = true;
    const bootstrap = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const data = await api.players.me();
          if (!alive) return;
          setUser(normalizeAuthUser(data));
          await syncLocalPlayerToServer().catch(() => {});
          return;
        } catch {
          setAuthToken(null);
        } finally {
          if (alive) setLoading(false);
        }
      }

      if (!canUseDevAutologin()) {
        if (alive) setLoading(false);
        return;
      }

      const { handle, password } = loadOrCreateDevCredentials();
      const role = (import.meta.env.VITE_DEV_AUTOLOGIN_ROLE || 'moderator').trim().toLowerCase() === 'attendee'
        ? 'attendee'
        : 'moderator';

      try {
        let auth;
        try {
          auth = await api.auth.login(handle, password);
        } catch {
          auth = await api.auth.register(handle, password, role);
        }
        if (!alive) return;
        setAuthToken(auth.token);
        setUser({ handle: auth.handle, role: auth.role as UserRole, tenantId: 'default' });
        await syncLocalPlayerToServer().catch(() => {});
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error';
        console.warn(`Dev autologin failed: ${message}`);
      } finally {
        if (alive) setLoading(false);
      }
    };

    void bootstrap();
    return () => {
      alive = false;
    };
  }, []);

  const role = user?.role ?? null;

  const registerModerator = useCallback(async (handle: string, password: string) => {
    const res = await api.auth.register(handle, password, 'moderator');
    setAuthToken(res.token);
    setUser({ handle: res.handle, role: res.role as UserRole, tenantId: 'default' });
    await syncLocalPlayerToServer().catch(() => {});
  }, []);

  const login = useCallback(async (handle: string, password: string) => {
    const res = await api.auth.login(handle, password);
    setAuthToken(res.token);
    setUser({ handle: res.handle, role: res.role as UserRole, tenantId: 'default' });
    await syncLocalPlayerToServer().catch(() => {});
  }, []);

  const joinSession = useCallback(async (
    pin: string,
    handle: string,
    email: string,
    profile?: { firstName?: string; lastName?: string; avatarId?: string }
  ) => {
    const res = await api.auth.joinSession(pin, handle, email, profile);
    setAuthToken(res.token);
    setUser({
      handle: res.handle,
      role: res.role as UserRole,
      tenantId: 'default',
      workshopId: res.sessionId,
      sessionId: res.sessionId,
      sessionName: res.sessionName,
      email,
      firstName: profile?.firstName,
      lastName: profile?.lastName,
      avatarId: profile?.avatarId,
    });
    await syncLocalPlayerToServer().catch(() => {});
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
