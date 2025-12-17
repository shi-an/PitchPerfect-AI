import { User } from '../types';

// Simulate a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email: string, password: string): Promise<User> => {
  await delay(800);
  if (email.includes('error')) throw new Error('Invalid credentials');
  
  const user: User = {
    id: 'user_123',
    name: email.split('@')[0],
    email: email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  };
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  await delay(1000);
  const user: User = {
    id: `user_${Date.now()}`,
    name,
    email,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
  };
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await delay(1200);
  // Simulate logic checking if email exists
  if (!email.includes('@')) throw new Error('Invalid email address');
  // Return success (void)
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
};
