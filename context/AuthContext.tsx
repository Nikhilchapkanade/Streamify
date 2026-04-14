import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Check for active session on load
    const checkSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load session', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Redirect to login if unauthenticated and not already in auth screens
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to main tabs if authenticated but trying to access login
      router.replace('/(tabs)/home');
    }
  }, [user, segments, isLoading]);

  const login = async (email: string, pass: string) => {
    // Local DB authentication using AsyncStorage
    try {
      const usersStr = await AsyncStorage.getItem('@app_users') || '[]';
      const users = JSON.parse(usersStr);
      
      const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
      if (!found) throw new Error('Invalid email or password');

      const activeUser = { id: found.id, name: found.name, email: found.email };
      setUser(activeUser);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(activeUser));
    } catch (e) {
      throw e;
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    try {
      const usersStr = await AsyncStorage.getItem('@app_users') || '[]';
      const users = JSON.parse(usersStr);

      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
         throw new Error('Email already exists');
      }

      const newUser = { id: `u_${Date.now()}`, name, email, password: pass };
      users.push(newUser);
      await AsyncStorage.setItem('@app_users', JSON.stringify(users));

      const activeUser = { id: newUser.id, name: newUser.name, email: newUser.email };
      setUser(activeUser);
      await AsyncStorage.setItem('@auth_user', JSON.stringify(activeUser));
    } catch (e) {
      throw e;
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
