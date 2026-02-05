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

// Configurable PIN - can be set via environment variable or workshop config
// Default remains '163500' for backward compatibility
const getCorrectPin = (): string => {
  // In future phases, this will come from backend/workshop config
  const envPin = import.meta.env.VITE_MODERATOR_PIN;
  const configPin = localStorage.getItem('workshop_moderator_pin');
  return configPin || envPin || '163500';
};

function verifyPin(pin: string): boolean {
  return pin === getCorrectPin();
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
    return verifyPin(pin);
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
