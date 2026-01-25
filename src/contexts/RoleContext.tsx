import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

type UserRole = 'moderator' | 'attendee' | null;

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isModerator: boolean;
  isAttendee: boolean;
  verifyModeratorPin: (pin: string) => boolean;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Obfuscated PIN - XOR with key for basic obfuscation
const OBFUSCATION_KEY = 'MONGODB_SA_2024';
const OBFUSCATED_PIN = 'BgYABwcA'; // 163500 obfuscated

function deobfuscatePin(): string {
  try {
    const decoded = atob(OBFUSCATED_PIN);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('user_role');
    return (saved as UserRole) || null;
  });

  useEffect(() => {
    if (role) {
      localStorage.setItem('user_role', role);
    } else {
      localStorage.removeItem('user_role');
    }
  }, [role]);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  const verifyModeratorPin = useCallback((pin: string): boolean => {
    const correctPin = deobfuscatePin();
    return pin === correctPin;
  }, []);

  const logout = useCallback(() => {
    setRoleState(null);
    localStorage.removeItem('user_role');
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isModerator: role === 'moderator',
        isAttendee: role === 'attendee',
        verifyModeratorPin,
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
