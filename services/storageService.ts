import { PitchSession } from '../types';

const API = '/api';

const authHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const savePitchSession = async (session: PitchSession): Promise<void> => {
  const res = await fetch(`${API}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(session)
  });
  if (!res.ok) throw new Error('保存失败');
};

export const getUserHistory = async (userId: string): Promise<PitchSession[]> => {
  const res = await fetch(`${API}/sessions`, {
    method: 'GET',
    headers: { ...authHeaders() }
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data;
};

export const getPitchSession = async (id: string): Promise<PitchSession | null> => {
    const res = await fetch(`${API}/sessions/${id}`, {
      method: 'GET',
      headers: { ...authHeaders() }
    });
    if (!res.ok) return null;
    return await res.json();
  };

export const deletePitchSession = async (id: string): Promise<void> => {
  const res = await fetch(`${API}/sessions/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('删除失败');
};

export const pinPitchSession = async (id: string, isPinned: boolean): Promise<void> => {
  const res = await fetch(`${API}/sessions/${id}/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ isPinned })
  });
  if (!res.ok) throw new Error('操作失败');
};

export const renamePitchSession = async (id: string, customName: string): Promise<void> => {
  const res = await fetch(`${API}/sessions/${id}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ customName })
  });
  if (!res.ok) throw new Error('操作失败');
};

export const getUserConfig = async (): Promise<{ savedStartup?: { name: string; description: string }, defaultPersonaId?: string } | null> => {
  const res = await fetch(`${API}/user/config`, {
    method: 'GET',
    headers: { ...authHeaders() }
  });
  if (!res.ok) return null;
  return await res.json();
};

export const saveUserConfig = async (payload: { savedStartup?: { name: string; description: string }, defaultPersonaId?: string }): Promise<void> => {
  const res = await fetch(`${API}/user/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('配置保存失败');
};

export const listUserStartups = async (): Promise<{ items: { id: string; name: string; description: string }[], defaultStartupId: string | null } | null> => {
  const res = await fetch(`${API}/user/startups`, {
    method: 'GET',
    headers: { ...authHeaders() }
  });
  if (!res.ok) return null;
  return await res.json();
};

export const upsertUserStartup = async (payload: { id?: string; name: string; description: string }): Promise<void> => {
  const res = await fetch(`${API}/user/startups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('保存创业资料失败');
};

export const deleteUserStartup = async (id: string): Promise<void> => {
  const res = await fetch(`${API}/user/startups/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() }
  });
  if (!res.ok) throw new Error('删除创业资料失败');
};

export const setDefaultUserStartup = async (id: string): Promise<void> => {
  const res = await fetch(`${API}/user/startups/default`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ id })
  });
  if (!res.ok) throw new Error('设置默认创业资料失败');
};
