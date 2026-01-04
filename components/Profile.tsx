import React, { useEffect, useState } from 'react';
import { User, PitchSession, ViewState } from '../types';
import { getUserHistory, listUserStartups, upsertUserStartup, deleteUserStartup, setDefaultUserStartup } from '../services/storageService';
import { Trophy, Target, Activity, Clock, LogOut, User as UserIcon, Calendar, ArrowRight, TrendingUp, Plus, Trash2, Edit, Star, Bot, Crown, Edit2, Lock, BookOpen } from 'lucide-react';
import { updateUserProfile, changePassword } from '../services/authService';
import { useUI } from '../contexts/UIContext';

interface Props {
  user: User;
  onLogout: () => void;
  onNavigate: (view: ViewState, data?: { sessionId?: string; filter?: 'all' | 'pitch' | 'mentor' }) => void;
}

export const Profile: React.FC<Props> = ({ user, onLogout, onNavigate }) => {
  const { toast } = useUI();
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', role: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    fundedRate: 0,
    highestScore: 0
  });
  const [recentPitches, setRecentPitches] = useState<PitchSession[]>([]);
  const [recentMentoring, setRecentMentoring] = useState<PitchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [startupItems, setStartupItems] = useState<{ id: string; name: string; description: string }[]>([]);
  const [defaultStartupId, setDefaultStartupId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ id?: string; name: string; description: string }>({ name: '', description: '' });
  const [savingStartup, setSavingStartup] = useState(false);
  
  const [modelProvider, setModelProvider] = useState<string>(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('model_provider') : null;
      return (stored || 'deepseek').toLowerCase();
    } catch {
      return 'deepseek';
    }
  });

  const [systemStatus, setSystemStatus] = useState({
    gemini: false,
    deepseek: false,
    defaultProvider: 'deepseek'
  });

  useEffect(() => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        setSystemStatus(data);
        // If no local preference, sync with server default
        if (typeof localStorage !== 'undefined' && !localStorage.getItem('model_provider')) {
             setModelProvider(data.defaultProvider);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const history = await getUserHistory(user.id);
      
      if (history.length > 0) {
        const total = history.length;
        const totalScore = history.reduce((acc, curr) => acc + curr.score, 0);
        const fundedCount = history.filter(h => h.report?.funding_decision === 'Funded').length;
        const highest = Math.max(...history.map(h => h.score));

        setStats({
            total,
            avgScore: Math.round(totalScore / total),
            fundedRate: Math.round((fundedCount / total) * 100),
            highestScore: highest
        });
        
        // Filter and sort for two columns
        const pitches = history.filter(h => h.persona.id !== 'mentor').slice(0, 3);
        const mentoring = history.filter(h => h.persona.id === 'mentor').slice(0, 3);
        
        setRecentPitches(pitches);
        setRecentMentoring(mentoring);
      }
      setLoading(false);
    };
    loadData();
  }, [user.id]);
  
  useEffect(() => {
    const loadStartups = async () => {
      const data = await listUserStartups();
      if (data) {
        setStartupItems(data.items || []);
        setDefaultStartupId(data.defaultStartupId || null);
      }
    };
    loadStartups();
  }, [user.id]);

  const handleEdit = (item?: { id: string; name: string; description: string }) => {
    setEditor(item ? { id: item.id, name: item.name, description: item.description } : { name: '', description: '' });
  };

  const handleSave = async () => {
    if (!editor.name.trim() || !editor.description.trim()) return;
    setSavingStartup(true);
    try {
      await upsertUserStartup(editor);
      const data = await listUserStartups();
      if (data) {
        setStartupItems(data.items || []);
        setDefaultStartupId(data.defaultStartupId || null);
      }
      setEditor({ name: '', description: '' });
    } finally {
      setSavingStartup(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteUserStartup(id);
    const data = await listUserStartups();
    if (data) {
      setStartupItems(data.items || []);
      setDefaultStartupId(data.defaultStartupId || null);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultUserStartup(id);
    setDefaultStartupId(id);
  };
  const handleProviderChange = (p: string) => {
    setModelProvider(p);
    try { localStorage.setItem('model_provider', p); } catch {}
  };

  if (loading) {
     return <div className="p-12 text-center text-slate-500">正在加载个人数据…</div>;
  }

  const getPlanName = (plan?: string) => {
      switch(plan) {
          case 'PRO': return 'Pro 版';
          case 'ENTERPRISE': return '企业版';
          default: return '免费版';
      }
  };

  const getRoleName = (role?: string) => {
    switch(role) {
      case 'FOUNDER': return '创业者';
      case 'STUDENT': return '学生';
      case 'INVESTOR': return '投资人';
      case 'OTHER': return '用户';
      default: return '创业者';
    }
  };

  const handleUpdateProfile = async () => {
      try {
          await updateUserProfile({ name: profileForm.name, role: profileForm.role });
          setEditingProfile(false);
          toast.success('个人资料已更新');
      } catch {
          toast.error('更新失败');
      }
  };

  const startEditProfile = () => {
      setProfileForm({ name: user.name, role: user.role || 'FOUNDER' });
      setEditingProfile(true);
  };

  const handleChangePassword = async () => {
      if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
          toast.error('请填写所有密码字段');
          return;
      }
      if (passwordForm.new !== passwordForm.confirm) {
          toast.error('两次输入的新密码不一致');
          return;
      }
      if (passwordForm.new.length < 8) {
          toast.error('新密码至少需要 8 位');
          return;
      }

      try {
          await changePassword(passwordForm.current, passwordForm.new);
          toast.success('密码修改成功');
          setChangingPassword(false);
          setPasswordForm({ current: '', new: '', confirm: '' });
      } catch (e: any) {
          toast.error(e.message || '修改密码失败');
      }
  };

  return (
    <div className="h-full overflow-y-auto">
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col items-center justify-between gap-6 mb-12 bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-800 relative">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
          <div className="relative">
            <img src={user.avatar} alt="Profile" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-800 bg-slate-700" />
            <div className="absolute bottom-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-emerald-500 rounded-full border-4 border-slate-900" title="在线"></div>
          </div>
          <div className="flex-1">
            {editingProfile ? (
                <div className="flex flex-col gap-2">
                    <input 
                        value={profileForm.name} 
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-lg font-bold"
                    />
                    <select 
                        value={profileForm.role}
                        onChange={e => setProfileForm({...profileForm, role: e.target.value})}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                    >
                        <option value="FOUNDER">我是创业者</option>
                        <option value="STUDENT">我是学生</option>
                        <option value="INVESTOR">我是投资人</option>
                        <option value="OTHER">其他</option>
                    </select>
                    <div className="flex gap-2 mt-1">
                        <button onClick={handleUpdateProfile} className="text-xs bg-violet-600 text-white px-2 py-1 rounded">保存</button>
                        <button onClick={() => setEditingProfile(false)} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">取消</button>
                    </div>
                </div>
            ) : (
                <>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{user.name}</h1>
                    <button onClick={startEditProfile} className="text-slate-500 hover:text-white p-1">
                        <Edit2 className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-sm">
                <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> {getRoleName(user.role)}</span>
                <span className="flex items-center gap-1">
                    <Crown className={`w-4 h-4 ${user.plan === 'PRO' ? 'text-violet-400' : user.plan === 'ENTERPRISE' ? 'text-amber-400' : 'text-slate-400'}`} /> 
                    {getPlanName(user.plan)}
                </span>
                </div>
                </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 relative w-full justify-center sm:justify-end">
            {!changingPassword ? (
                <button 
                onClick={() => setChangingPassword(true)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 border border-slate-700 w-full sm:w-auto"
                >
                <Lock className="w-5 h-5" />
                安全设置
                </button>
            ) : (
                <div className="absolute top-full right-0 mt-4 w-full max-w-xs z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 origin-top-right">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <Lock className="w-4 h-4 text-violet-400" /> 修改密码
                        </h3>
                        <button onClick={() => setChangingPassword(false)} className="text-slate-500 hover:text-white"><Trash2 className="w-4 h-4 rotate-45" /></button>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <input 
                                type="password"
                                value={passwordForm.current}
                                onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                                placeholder="当前密码"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <input 
                                type="password"
                                value={passwordForm.new}
                                onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                                placeholder="新密码 (至少8位)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <input 
                                type="password"
                                value={passwordForm.confirm}
                                onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                placeholder="确认新密码"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-violet-500"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={handleChangePassword}
                                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-violet-900/20"
                            >
                                确认修改
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <button 
            onClick={onLogout}
            className="px-6 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 rounded-xl transition-all flex items-center gap-2 border border-slate-700 w-full sm:w-auto"
            >
            <LogOut className="w-5 h-5" />
            退出登录
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700 hover:border-violet-500/50 transition-colors">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mb-2 md:mb-3">
               <Activity className="w-4 h-4 md:w-5 md:h-5 text-violet-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">路演总数</div>
        </div>
        
        <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-2 md:mb-3">
               <Target className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.fundedRate}%</div>
            <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">获投率</div>
        </div>

        <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition-colors">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-2 md:mb-3">
               <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.highestScore}</div>
            <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">最高分</div>
        </div>

        <div className="bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-2 md:mb-3">
               <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.avgScore}</div>
            <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">平均分</div>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-12">
        {/* Pitch Results */}
        <div className="space-y-4">
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                路演结果
             </h2>
             <button 
                onClick={() => onNavigate(ViewState.HISTORY, { filter: 'pitch' })}
                className="text-slate-500 hover:text-violet-300 text-xs flex items-center gap-1"
             >
                查看全部 <ArrowRight className="w-3 h-3" />
             </button>
           </div>
           
           {recentPitches.length === 0 ? (
               <div className="p-8 border border-slate-800 rounded-2xl text-center text-slate-500 bg-slate-900/30 h-[200px] flex items-center justify-center">
                  暂无路演记录
               </div>
           ) : (
               <div className="space-y-3">
                  {recentPitches.map(session => (
                      <button 
                        key={session.id} 
                        onClick={() => onNavigate(ViewState.PITCHING, { sessionId: session.id })}
                        className="w-full p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between hover:border-violet-500/30 hover:bg-slate-800/50 transition-all group text-left"
                      >
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  session.report?.funding_decision === 'Funded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                  {session.report?.funding_decision === 'Funded' ? <Trophy className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                              </div>
                              <div className="min-w-0">
                                  <h4 className="font-bold text-slate-200 truncate max-w-[150px] group-hover:text-white transition-colors">{session.startup.name}</h4>
                                  <p className="text-xs text-slate-500">对 {session.persona.name}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`font-bold ${session.isCompleted ? 'text-white' : 'text-slate-500'}`}>
                                  {session.isCompleted ? session.score : '未完成'}
                              </div>
                              <div className="text-[10px] text-slate-600">{new Date(session.date).toLocaleDateString()}</div>
                          </div>
                      </button>
                  ))}
               </div>
           )}
        </div>

        {/* Mentoring Sessions */}
        <div className="space-y-4">
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                导师指导
             </h2>
             <button 
                onClick={() => onNavigate(ViewState.HISTORY, { filter: 'mentor' })}
                className="text-slate-500 hover:text-emerald-300 text-xs flex items-center gap-1"
             >
                查看全部 <ArrowRight className="w-3 h-3" />
             </button>
           </div>
           
           {recentMentoring.length === 0 ? (
               <div className="p-8 border border-slate-800 rounded-2xl text-center text-slate-500 bg-slate-900/30 h-[200px] flex items-center justify-center">
                  暂无指导记录
               </div>
           ) : (
               <div className="space-y-3">
                  {recentMentoring.map(session => (
                      <button 
                        key={session.id} 
                        onClick={() => onNavigate(ViewState.PITCHING, { sessionId: session.id })}
                        className="w-full p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between hover:border-emerald-500/30 hover:bg-slate-800/50 transition-all group text-left"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                  <BookOpen className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                  <h4 className="font-bold text-slate-200 truncate max-w-[150px] group-hover:text-white transition-colors">{session.startup.name}</h4>
                                  <p className="text-xs text-slate-500">莎拉·导师</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-white">{session.messages.length} 条对话</div>
                              <div className="text-[10px] text-slate-600">{new Date(session.date).toLocaleDateString()}</div>
                          </div>
                      </button>
                  ))}
               </div>
           )}
        </div>
      </div>
      </div>
    </div>
  );
};
