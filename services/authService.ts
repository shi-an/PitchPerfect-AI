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
  const user: User = { 
      id: data.user.id, 
      name: data.user.name, 
      email: data.user.email, 
      avatar: data.user.avatar, 
      plan: data.user.plan,
      role: data.user.role // Added role
  };
  saveAuth(data.token, user);
  return user;
};

export const register = async (name: string, email: string, password: string, role: string = 'FOUNDER'): Promise<User> => {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error === 'email_exists' ? '邮箱已存在' : '注册失败');
  }
  const data = await res.json();
  const user: User = { 
      id: data.user.id, 
      name: data.user.name, 
      email: data.user.email, 
      avatar: data.user.avatar, 
      plan: data.user.plan,
      role: data.user.role // Added role
  };
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

export const fetchCurrentUser = async (): Promise<User> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API}/me`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error('Failed to fetch user');
    const data = await res.json();
    const user: User = { 
        id: data.id, 
        name: data.name, 
        email: data.email, 
        avatar: data.avatar, 
        plan: data.plan,
        role: data.role
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API}/user/password`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'invalid_password') throw new Error('当前密码错误');
        if (data.error === 'weak_password') throw new Error('新密码太弱（至少8位）');
        throw new Error('修改密码失败');
    }
};

export const upgradeUserPlan = async (plan: 'FREE' | 'PRO' | 'ENTERPRISE'): Promise<void> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API}/user/upgrade`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
    });

    if (!res.ok) throw new Error('Upgrade failed');
};

export const updateUserProfile = async (data: { name?: string; role?: string }): Promise<User> => {
    const token = localStorage.getItem('auth_token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API}/user/profile`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Update failed');
    const responseData = await res.json();
    const user: User = { 
        id: responseData.user.id, 
        name: responseData.user.name, 
        email: responseData.user.email, 
        avatar: responseData.user.avatar, 
        plan: responseData.user.plan,
        role: responseData.user.role
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
};
