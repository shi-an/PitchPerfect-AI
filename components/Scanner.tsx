import React, { useEffect, useState } from 'react';
import { Rocket, Briefcase, Glasses, User, ArrowRight, ChevronRight, Plus, Bot, Settings2, Trash2, Save, Edit, BookOpen } from 'lucide-react';
import { Persona, StartupDetails } from '../types';
import { getUserConfig, saveUserConfig, listUserStartups, upsertUserStartup, deleteUserStartup } from '../services/storageService';
import { useUI } from '../contexts/UIContext';

interface Props {
  onStart: (persona: Persona, details: StartupDetails) => void;
}

const PERSONAS: Persona[] = [
  {
    id: 'shark',
    name: '凯文「鲨鱼」',
    role: '风险投资人',
    description: '冷酷无情：只看利润、获客成本与用户生命周期价值。厌恶空话。',
    style: '简短、强势、以数据为中心。',
    icon: 'shark',
    color: 'bg-red-500'
  },
  {
    id: 'visionary',
    name: '伊拉拉·月',
    role: '天使投资人',
    description: '寻找登月项目，关注“为什么”与人类影响。',
    style: '鼓舞人心、抽象、充满好奇。',
    icon: 'star',
    color: 'bg-purple-500'
  },
  {
    id: 'skeptic',
    name: '戴夫·运营',
    role: '技术创始人',
    description: '前 CTO，深挖技术栈与可行性。',
    style: '细致、怀疑、技术导向。',
    icon: 'code',
    color: 'bg-blue-500'
  },
  {
    id: 'mentor',
    name: '莎拉·导师',
    role: '创业导师',
    description: '专为新手设计。我会解释每一个术语，手把手教你梳理商业逻辑。',
    style: '耐心、教学、循循善诱。',
    icon: 'book',
    color: 'bg-emerald-500'
  }
];

export const SetupScreen: React.FC<Props> = ({ onStart }) => {
  const { toast, confirm } = useUI();
  const [step, setStep] = useState<1 | 2>(1);
  const [details, setDetails] = useState<StartupDetails>({ name: '', description: '' });
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);
  const [savedStartups, setSavedStartups] = useState<{ id: string; name: string; description: string }[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  
  // Model Selection State
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

  const canStart = details.name.length > 2 && details.description.length > 10;

  useEffect(() => {
    const run = async () => {
      // Fetch System Status
      fetch('/api/system/status')
        .then(res => res.json())
        .then(data => {
            setSystemStatus(data);
            if (!localStorage.getItem('model_provider')) {
                setModelProvider(data.defaultProvider);
            }
        }).catch(() => {});

      try {
        const startups = await listUserStartups();
        if (startups && startups.items?.length) {
          setSavedStartups(startups.items);
          const defId = startups.defaultStartupId || startups.items[0]?.id;
          const def = startups.items.find(s => s.id === defId) || startups.items[0];
          if (def) {
              setDetails({ name: def.name, description: def.description });
              setSelectedStartupId(def.id);
          }
        } else {
            // Fallback to legacy config if no saved startups list
            const cfg = await getUserConfig();
            if (cfg?.savedStartup?.name) {
                setDetails({ name: cfg.savedStartup.name, description: cfg.savedStartup.description });
            }
        }
        
        const cfg = await getUserConfig();
        if (cfg?.defaultPersonaId) {
          const found = PERSONAS.find(p => p.id === cfg.defaultPersonaId);
          if (found) setSelectedPersona(found);
        }
      } catch {}
    };
    run();
  }, []);

  const handleProviderChange = (p: string) => {
    setModelProvider(p);
    try { localStorage.setItem('model_provider', p); } catch {}
  };

  const refreshStartups = async () => {
      const startups = await listUserStartups();
      if (startups && startups.items) {
          setSavedStartups(startups.items);
      }
  };

  const handleSelectStartup = (id: string) => {
      if (id === 'new') {
          setSelectedStartupId(null);
          setDetails({ name: '', description: '' });
      } else {
          const found = savedStartups.find(s => s.id === id);
          if (found) {
              setSelectedStartupId(id);
              setDetails({ name: found.name, description: found.description });
          }
      }
  };

  const handleSaveStartup = async () => {
      if (!details.name || !details.description) return;
      // If selectedStartupId exists, update it. Otherwise create new.
      const id = selectedStartupId || Date.now().toString();
      await upsertUserStartup({ id, name: details.name, description: details.description });
      await refreshStartups();
      setSelectedStartupId(id);
      toast.success('项目已保存');
  };

  const handleDeleteStartup = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const confirmed = await confirm({
        title: '删除项目',
        message: '确定要删除这个项目资料吗？此操作无法撤销。',
        type: 'danger',
        confirmText: '删除',
        cancelText: '取消'
      });
      if (!confirmed) return;
      
      await deleteUserStartup(id);
      await refreshStartups();
      if (selectedStartupId === id) {
          setSelectedStartupId(null);
          setDetails({ name: '', description: '' });
      }
      toast.info('项目已删除');
  };

  const handleStart = async () => {
      if (!canStart) return;
      // We do NOT auto-save as new config anymore to prevent duplicates.
      // We only save the preference of which persona was last used.
      try {
        await saveUserConfig({ defaultPersonaId: selectedPersona.id });
      } catch {}
      onStart(selectedPersona, details);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 w-full animate-in zoom-in duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
            {step === 1 ? '选择模拟对象' : '准备你的路演'}
        </h2>
        <p className="text-slate-400">
            {step === 1 ? '你想向谁进行路演？' : '告诉投资人你的项目详情'}
        </p>
      </div>

      {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300">
            {/* Model Selector Card */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-violet-400" />
                        <span className="font-bold text-white text-sm">选择 AI 模型</span>
                    </div>
                    <span className="text-xs text-slate-500">选择您的路演对手</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleProviderChange('deepseek')}
                        className={`relative p-3 rounded-lg border transition-all text-left ${
                            modelProvider === 'deepseek' 
                            ? 'bg-violet-500/10 border-violet-500 text-violet-300' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        <div className="font-bold text-sm">标准版 (Basic)</div>
                        <div className="text-xs opacity-70">快速响应 • 基础智能</div>
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${systemStatus.deepseek ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </button>
                    <button
                        onClick={() => handleProviderChange('gemini')}
                        className={`relative p-3 rounded-lg border transition-all text-left ${
                            modelProvider === 'gemini' 
                            ? 'bg-violet-500/10 border-violet-500 text-violet-300' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        <div className="font-bold text-sm">高级版 (Pro)</div>
                        <div className="text-xs opacity-70">深度思考 • 复杂逻辑</div>
                        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${systemStatus.gemini ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Investors Section */}
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 ml-1">模拟投资人</h3>
                    <div className="space-y-3">
                        {PERSONAS.filter(p => p.id !== 'mentor').map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPersona(p)}
                            className={`w-full relative flex items-center p-4 rounded-xl border transition-all duration-300 text-left group ${
                            selectedPersona.id === p.id
                                ? 'bg-slate-800 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.02] ring-1 ring-violet-500'
                                : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-1'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center mr-4 shrink-0 shadow-lg transition-transform group-hover:scale-110`}>
                            {p.id === 'shark' && <Briefcase className="text-white w-5 h-5" />}
                            {p.id === 'visionary' && <Rocket className="text-white w-5 h-5" />}
                            {p.id === 'skeptic' && <Glasses className="text-white w-5 h-5" />}
                            </div>
                            <div>
                            <h3 className={`font-bold transition-colors ${selectedPersona.id === p.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                {p.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">{p.role} • {p.style}</p>
                            </div>
                            {selectedPersona.id === p.id && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                            )}
                        </button>
                        ))}
                    </div>
                </div>

                {/* Mentors Section */}
                <div>
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 ml-1">学习与指导</h3>
                    <div className="space-y-3">
                        {PERSONAS.filter(p => p.id === 'mentor').map(p => (
                        <button
                            key={p.id}
                            onClick={() => setSelectedPersona(p)}
                            className={`w-full relative flex items-center p-4 rounded-xl border transition-all duration-300 text-left group ${
                            selectedPersona.id === p.id
                                ? 'bg-emerald-900/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02] ring-1 ring-emerald-500'
                                : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50 hover:-translate-y-1'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center mr-4 shrink-0 shadow-lg transition-transform group-hover:scale-110`}>
                                <BookOpen className="text-white w-5 h-5" />
                            </div>
                            <div>
                            <h3 className={`font-bold transition-colors ${selectedPersona.id === p.id ? 'text-emerald-400' : 'text-slate-300 group-hover:text-emerald-400'}`}>
                                {p.name}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">{p.role} • {p.style}</p>
                            </div>
                            {selectedPersona.id === p.id && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            )}
                        </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex justify-center pt-8">
                <button
                    onClick={() => setStep(2)}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors flex items-center gap-2 border border-slate-700"
                >
                    下一步 <ChevronRight className="w-4 h-4" />
                </button>
            </div>
          </div>
      )}

      {step === 2 && (
        <div className="animate-in slide-in-from-right-8 duration-300">
             <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* Saved Startups List */}
                <div className="md:col-span-1 space-y-3">
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">已保存的项目</h3>
                    <button
                        onClick={() => handleSelectStartup('new')}
                        className={`w-full p-3 rounded-xl border text-left text-sm transition-colors flex items-center gap-2 ${
                            selectedStartupId === null
                            ? 'bg-violet-500/10 border-violet-500 text-violet-300'
                            : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                        <Plus className="w-4 h-4" /> 新建项目
                    </button>
                    {savedStartups.map(s => (
                        <button
                            key={s.id}
                            onClick={() => handleSelectStartup(s.id)}
                            className={`w-full p-3 rounded-xl border text-left text-sm transition-colors ${
                                selectedStartupId === s.id
                                ? 'bg-violet-500/10 border-violet-500 text-violet-300'
                                : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                        >
                            <div className="font-bold truncate">{s.name}</div>
                            <div className="text-xs opacity-70 truncate">{s.description}</div>
                        </button>
                    ))}
                </div>

                {/* Editor */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase text-slate-500">项目详情</h3>
                        <div className="flex gap-2">
                             <button 
                                onClick={handleSaveStartup}
                                disabled={!details.name || !details.description}
                                className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-400 transition-colors"
                             >
                                <Save className="w-3 h-3" /> 保存项目
                             </button>
                             {selectedStartupId && (
                                <button 
                                    onClick={(e) => handleDeleteStartup(e, selectedStartupId)}
                                    className="text-xs flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3" /> 删除
                                </button>
                             )}
                        </div>
                    </div>
                    
                    <div className="group">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block group-focus-within:text-violet-400 transition-colors">公司名称</label>
                    <input
                        type="text"
                        value={details.name}
                        onChange={(e) => {
                            setDetails({ ...details, name: e.target.value });
                            if (selectedStartupId) setSelectedStartupId(null); // Switch to 'custom' mode if editing a saved one
                        }}
                        placeholder="例如：宠物出行的优步"
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-slate-800 outline-none text-white transition-all placeholder:text-slate-600 shadow-sm"
                    />
                    </div>
                    
                    <div className="group">
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block group-focus-within:text-violet-400 transition-colors">电梯演讲</label>
                    <textarea
                        value={details.description}
                        onChange={(e) => {
                            setDetails({ ...details, description: e.target.value });
                            if (selectedStartupId) setSelectedStartupId(null);
                        }}
                        placeholder="我们通过自动驾驶车辆帮助宠物通勤上班……"
                        className="w-full h-40 bg-slate-800/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:bg-slate-800 outline-none text-white transition-all resize-none placeholder:text-slate-600 shadow-sm"
                    />
                    </div>
                </div>
             </div>

             <div className="flex justify-between pt-4 border-t border-slate-800">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
                >
                    上一步
                </button>
                <button
                    onClick={handleStart}
                    disabled={!canStart}
                    className={`px-12 py-3 rounded-xl font-bold tracking-wide shadow-lg transition-all duration-300 flex items-center gap-2 ${
                        canStart 
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:scale-105 active:scale-95 shadow-violet-900/50 hover:shadow-violet-900/70' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed grayscale'
                    }`}
                >
                    开始模拟
                    {canStart && <ArrowRight className="w-5 h-5 animate-pulse" />}
                </button>
             </div>
        </div>
      )}
    </div>
  );
};
