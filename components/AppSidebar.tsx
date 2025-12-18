import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserHistory, deletePitchSession, pinPitchSession, renamePitchSession } from '../services/storageService';
import { PitchSession } from '../types';
import { Plus, MessageSquare, LogOut, User as UserIcon, Settings, ChevronLeft, ChevronRight, Trash2, Pin, Share2, MoreHorizontal, Edit2 } from 'lucide-react';
import { useUI } from '../contexts/UIContext';

export const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast, confirm } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessions, setSessions] = useState<PitchSession[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Sort sessions: pinned first, then by date
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  useEffect(() => {
    let active = true;
    if (user) {
      getUserHistory(user.id).then(data => {
        if (active) setSessions(data);
      }).catch(() => {});
    }
    
    // Listen to custom event for history updates
    const handleHistoryUpdate = () => {
        if (user) {
            getUserHistory(user.id).then(data => {
                if (active) setSessions(data);
            }).catch(() => {});
        }
    };
    
    window.addEventListener('history-updated', handleHistoryUpdate);
    return () => {
        active = false;
        window.removeEventListener('history-updated', handleHistoryUpdate);
    };
  }, [user, location.pathname]); // Reload when path changes (e.g. new session created)

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePin = async (e: React.MouseEvent, session: PitchSession) => {
    e.preventDefault();
    e.stopPropagation();
    try {
        await pinPitchSession(session.id, !session.isPinned);
        setSessions(prev => prev.map(s => s.id === session.id ? { ...s, isPinned: !s.isPinned } : s));
        setMenuOpenId(null);
    } catch {}
  };

  const handleRenameStart = (e: React.MouseEvent, session: PitchSession) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingId(session.id);
      setEditName(session.customName || session.startup.name || '未命名项目');
      setMenuOpenId(null);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingId || !editName.trim()) return;
      try {
          await renamePitchSession(editingId, editName);
          setSessions(prev => prev.map(s => s.id === editingId ? { ...s, customName: editName } : s));
          setEditingId(null);
      } catch {}
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      // Mock share
      const url = `${window.location.origin}/share/${id}`;
      navigator.clipboard.writeText(url);
      toast.success('分享链接已复制到剪贴板');
      setMenuOpenId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = await confirm({
        title: '删除历史记录',
        message: '确定要删除这条模拟记录吗？删除后将无法恢复。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
    });
    if (!confirmed) return;
    
    try {
        await deletePitchSession(id);
        setSessions(prev => prev.filter(s => s.id !== id));
        if (location.pathname.includes(id)) {
            navigate('/app');
        }
        toast.info('记录已删除');
    } catch {
        toast.error('删除失败，请重试');
    }
  };

  if (!user) return null;

  const getRoleName = (role?: string) => {
    switch(role) {
      case 'FOUNDER': return '创业者';
      case 'STUDENT': return '学生';
      case 'INVESTOR': return '投资人';
      case 'OTHER': return '用户';
      default: return '创业者';
    }
  };

  const getPlanName = (plan?: string) => {
      switch(plan) {
          case 'PRO': return 'Pro 版';
          case 'ENTERPRISE': return '企业版';
          default: return '免费版';
      }
  };

  return (
    <div className={`flex flex-col h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} hidden md:flex`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
           <span className="font-bold text-white tracking-tight">PitchPerfect AI</span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/app')}
          className={`flex items-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors ${collapsed ? 'justify-center p-3' : 'px-4 py-2'}`}
          title="新模拟"
        >
          <Plus className="w-5 h-5" />
          {!collapsed && <span className="font-medium">开始新模拟</span>}
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800" onClick={() => setMenuOpenId(null)}>
        {!collapsed && <div className="px-2 py-2 text-xs font-bold text-slate-500 uppercase">历史记录</div>}
        {sortedSessions.map(session => (
          <div key={session.id} className="relative group">
          {editingId === session.id ? (
              <form onSubmit={handleRenameSubmit} className="px-2 py-1">
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => setEditingId(null)}
                    className="w-full bg-slate-900 border border-violet-500 rounded px-2 py-1 text-sm text-white outline-none"
                  />
              </form>
          ) : (
          <NavLink
            to={`/app/session/${session.id}`}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative pr-8 ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
            title={session.customName || session.startup.name}
          >
            {session.isPinned ? <Pin className="w-3 h-3 shrink-0 text-violet-400 rotate-45" /> : <MessageSquare className="w-4 h-4 shrink-0" />}
            
            {!collapsed && (
              <>
                <div className="truncate flex-1">
                    {session.customName || session.startup.name || '未命名项目'}
                </div>
                
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === session.id ? null : session.id);
                    }}
                    className={`absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-opacity ${menuOpenId === session.id ? 'opacity-100 text-white' : ''}`}
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
              </>
            )}
          </NavLink>
          )}

          {/* Context Menu */}
          {menuOpenId === session.id && !collapsed && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <button onClick={(e) => handlePin(e, session)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                      <Pin className="w-3 h-3" /> {session.isPinned ? '取消置顶' : '置顶'}
                  </button>
                  <button onClick={(e) => handleRenameStart(e, session)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                      <Edit2 className="w-3 h-3" /> 重命名
                  </button>
                  <button onClick={(e) => handleShare(e, session.id)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2">
                      <Share2 className="w-3 h-3" /> 分享
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button onClick={(e) => handleDelete(e, session.id)} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-slate-800 hover:text-red-300 flex items-center gap-2">
                      <Trash2 className="w-3 h-3" /> 删除
                  </button>
              </div>
          )}
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0">
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{user.name}</div>
                    <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <span className={`px-1 rounded text-[10px] ${user.plan === 'PRO' ? 'bg-violet-500/20 text-violet-400' : user.plan === 'ENTERPRISE' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                            {getPlanName(user.plan)}
                        </span>
                        <span>{getRoleName(user.role)}</span>
                    </div>
                </div>
            )}
        </div>
        {!collapsed && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-1">
                <button onClick={() => navigate('/app/profile')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-2 py-1.5 rounded hover:bg-slate-800">
                    <Settings className="w-4 h-4" /> 个人设置
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 px-2 py-1.5 rounded hover:bg-slate-800">
                    <LogOut className="w-4 h-4" /> 退出登录
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
