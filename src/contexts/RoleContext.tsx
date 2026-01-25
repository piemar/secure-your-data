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

// Simple obfuscation - PIN stored as reversed base64  
// btoa("163500") = "MTYzNTAw", reversed = "wATNzYTM"
const OBFUSCATED_PIN = 'wATNzYTM'; // 163500 reversed base64

function deobfuscatePin(): string {
  try {
    // Reverse the string and decode
    const reversed = OBFUSCATED_PIN.split('').reverse().join('');
    return atob(reversed);
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
