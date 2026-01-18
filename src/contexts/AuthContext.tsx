import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/data/mockData';
import {
  getCurrentUser,
  setCurrentUser,
  getUserByEmail,
  addUser,
  getImpersonating,
  setImpersonating,
  stopImpersonating,
  initializeStorage,
  getEffectiveUser,
} from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  effectiveUser: User | null; // For impersonation
  isImpersonating: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: RegisterData) => { success: boolean; error?: string };
  logout: () => void;
  startImpersonation: (user: User) => void;
  endImpersonation: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  dob: string; // DD.MM.YYYY
  telegramUsername?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

  useEffect(() => {
    initializeStorage();
    const storedUser = getCurrentUser();
    const impersonating = getImpersonating();
    setUser(storedUser);
    setImpersonatedUser(impersonating);
  }, []);

  const login = (email: string, password: string) => {
    const foundUser = getUserByEmail(email);
    
    if (!foundUser) {
      return { success: false, error: 'Пользователь не найден' };
    }
    
    if (foundUser.password !== password) {
      return { success: false, error: 'Неверный пароль' };
    }
    
    setCurrentUser(foundUser);
    setUser(foundUser);
    return { success: true };
  };

  const register = (data: RegisterData) => {
    // Check if user exists
    if (getUserByEmail(data.email)) {
      return { success: false, error: 'Пользователь с таким email уже существует' };
    }
    
    // Validate age (18+)
    const dobParts = data.dob.split('.');
    if (dobParts.length !== 3) {
      return { success: false, error: 'Неверный формат даты рождения' };
    }
    
    const birthDate = new Date(
      parseInt(dobParts[2]),
      parseInt(dobParts[1]) - 1,
      parseInt(dobParts[0])
    );
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 18) {
      return { success: false, error: 'Регистрация доступна только для лиц старше 18 лет' };
    }
    
    const newUser: User = {
      id: `student-${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name || '',
      role: 'student',
      dob: data.dob,
      telegramUsername: data.telegramUsername,
      createdAt: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toISOString().split('T')[0],
      notificationsEnabled: true,
    };
    
    addUser(newUser);
    setCurrentUser(newUser);
    setUser(newUser);
    
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    stopImpersonating();
    setUser(null);
    setImpersonatedUser(null);
  };

  const startImpersonation = (targetUser: User) => {
    setImpersonating(targetUser);
    setImpersonatedUser(targetUser);
  };

  const endImpersonation = () => {
    stopImpersonating();
    setImpersonatedUser(null);
  };

  const effectiveUser = impersonatedUser || user;
  const isImpersonating = !!impersonatedUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        effectiveUser,
        isImpersonating,
        login,
        register,
        logout,
        startImpersonation,
        endImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
