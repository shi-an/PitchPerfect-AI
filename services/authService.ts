import { User } from '../types';

const API = '/api';

const saveAuth = (token: string, user: User) => {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const login = async (email: string, password: string): Promise<User> => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error === 'invalid_credentials' ? '凭据无效' : '登录失败');
  }
  const data = await res.json();
  const user: User = { id: data.user.id, name: data.user.name, email: data.user.email, avatar: data.user.avatar, plan: data.user.plan };
  saveAuth(data.token, user);
  return user;
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error === 'email_exists' ? '邮箱已存在' : '注册失败');
  }
  const data = await res.json();
  const user: User = { id: data.user.id, name: data.user.name, email: data.user.email, avatar: data.user.avatar, plan: data.user.plan };
  saveAuth(data.token, user);
  return user;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const res = await fetch(`${API}/auth/reset/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    throw new Error('邮箱地址无效');
  }
};

export const confirmPasswordReset = async (token: string, password: string): Promise<void> => {
  const res = await fetch(`${API}/auth/reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error === 'invalid_token' ? '重置令牌无效或已过期' : '重置失败');
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
};
