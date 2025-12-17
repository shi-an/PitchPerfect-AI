import React, { useEffect, useState } from 'react';
import { User, PitchSession, ViewState } from '../types';
import { getUserHistory, listUserStartups, upsertUserStartup, deleteUserStartup, setDefaultUserStartup } from '../services/storageService';
import { Trophy, Target, Activity, Clock, LogOut, User as UserIcon, Calendar, ArrowRight, TrendingUp, Plus, Trash2, Edit, Star, Bot } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
}

export const Profile: React.FC<Props> = ({ user, onLogout, onNavigate }) => {
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    fundedRate: 0,
    highestScore: 0
  });
  const [recent, setRecent] = useState<PitchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [startupItems, setStartupItems] = useState<{ id: string; name: string; description: string }[]>([]);
  const [defaultStartupId, setDefaultStartupId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ id?: string; name: string; description: string }>({ name: '', description: '' });
  const [savingStartup, setSavingStartup] = useState(false);
  const [modelProvider, setModelProvider] = useState<string>(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('model_provider') : null;
      return (stored || (process.env.MODEL_PROVIDER || 'deepseek')).toLowerCase();
    } catch {
      return (process.env.MODEL_PROVIDER || 'deepseek').toLowerCase();
    }
  });

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
        setRecent(history.slice(0, 3)); // Top 3 most recent
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

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-700" />
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900" title="在线"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> 创始人</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 2024 加入</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="px-6 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 rounded-xl transition-all flex items-center gap-2 border border-slate-700"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-violet-500/50 transition-colors">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mb-3">
               <Activity className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">路演总数</div>
        </div>
        
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
               <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.fundedRate}%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">获投率</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition-colors">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-3">
               <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.highestScore}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">最高分</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
               <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.avgScore}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">平均分</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-white">近期活动</h2>
             <button 
                onClick={() => onNavigate(ViewState.HISTORY)}
                className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
             >
                查看全部 <ArrowRight className="w-4 h-4" />
             </button>
           </div>
           
           {recent.length === 0 ? (
               <div className="p-8 border border-slate-800 rounded-2xl text-center text-slate-500 bg-slate-900/30">
                  暂无模拟，开始你的首次路演吧！
               </div>
           ) : (
               <div className="space-y-4">
                  {recent.map(session => (
                      <div key={session.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  session.report?.funding_decision === 'Funded' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                              }`}>
                                  {session.report?.funding_decision === 'Funded' ? <Trophy className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-200">{session.startup.name}</h4>
                                  <p className="text-xs text-slate-500">对 {session.persona.name} • {new Date(session.date).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-white">{session.score}</div>
                              <div className="text-xs text-slate-500">得分</div>
                          </div>
                      </div>
                  ))}
               </div>
           )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">快捷操作</h2>
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-center">
                <h3 className="text-white font-bold text-lg mb-2">开始新模拟</h3>
                <p className="text-white/80 text-sm mb-6">准备提升你的分数？重返竞技场。</p>
                <button 
                    onClick={() => onNavigate(ViewState.SETUP)}
                    className="w-full bg-white text-violet-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
                >
                    开始路演
                </button>
            </div>
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">模型选择</h3>
                <Bot className="w-4 h-4 text-violet-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="radio"
                      name="model-provider"
                      checked={modelProvider === 'deepseek'}
                      onChange={() => handleProviderChange('deepseek')}
                      className="accent-violet-500"
                    />
                    DeepSeek Chat
                  </label>
                  <span className="text-xs font-mono text-violet-400">
                    {process.env.DEEPSEEK_API_KEY ? '在线' : '未配置'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="radio"
                      name="model-provider"
                      checked={modelProvider === 'gemini'}
                      onChange={() => handleProviderChange('gemini')}
                      className="accent-violet-500"
                    />
                    Gemini 2.5 Flash
                  </label>
                  <span className="text-xs font-mono text-violet-400">
                    {process.env.GEMINI_API_KEY ? '在线' : '未配置'}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                模型切换将影响新的会话；正在进行的会话建议先结束。
              </div>
            </div>
            
             <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">创业项目资料</h3>
                  <button onClick={() => handleEdit(undefined)} className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> 新增
                  </button>
                </div>
                {startupItems.length === 0 ? (
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-sm">暂无保存的资料，点击新增进行初始化。</div>
                ) : (
                  <div className="space-y-3">
                    {startupItems.map(item => (
                      <div key={item.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white">{item.name}</h4>
                              {defaultStartupId === item.id && <Star className="w-4 h-4 text-amber-400" title="默认" />}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleSetDefault(item.id)} className="px-2 py-1 text-xs rounded-lg border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-400 transition-colors">
                              设为默认
                            </button>
                            <button onClick={() => handleEdit(item)} className="px-2 py-1 text-xs rounded-lg border border-slate-700 text-slate-300 hover:text-violet-400 hover:border-violet-400 transition-colors flex items-center gap-1">
                              <Edit className="w-3 h-3" /> 编辑
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-xs rounded-lg border border-slate-700 text-slate-300 hover:text-red-400 hover;border-red-400 transition-colors flex items-center gap-1">
                              <Trash2 className="w-3 h-3" /> 删除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  <input
                    type="text"
                    value={editor.name}
                    onChange={(e) => setEditor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="公司名称"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600"
                  />
                  <textarea
                    value={editor.description}
                    onChange={(e) => setEditor(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="电梯演讲"
                    className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-600 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditor({ name: '', description: '' })}
                      className="px-4 py-2 text-sm rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={savingStartup || !editor.name.trim() || !editor.description.trim()}
                      className="px-4 py-2 text-sm rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                      保存
                    </button>
                  </div>
                </div>
             </div>
            
             <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">账号状态</h3>
                <div className="space-y-3 text-sm text-slate-400">
                    <div className="flex justify-between">
                        <span>方案</span>
                        <span className="text-white font-medium">免费版</span>
                    </div>
                    <div className="flex justify-between">
                        <span>每日额度</span>
                        <span className="text-white font-medium">5/5</span>
                    </div>
                    <div className="flex justify-between">
                        <span>会员 ID</span>
                        <span className="text-white font-mono text-xs">#{user.id.slice(0,8)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
