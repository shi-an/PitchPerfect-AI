import React, { useEffect, useState } from 'react';
import { PitchSession, User } from '../types';
import { getUserHistory, deletePitchSession } from '../services/storageService';
import { Calendar, ChevronRight, Trophy, XCircle, Clock, Search, Trash2, LayoutGrid, Target, BookOpen } from 'lucide-react';

interface Props {
  user: User;
  onSelectSession: (session: PitchSession) => void;
  initialFilter?: 'all' | 'pitch' | 'mentor';
}

export const History: React.FC<Props> = ({ user, onSelectSession, initialFilter = 'all' }) => {
  const [sessions, setSessions] = useState<PitchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pitch' | 'mentor'>(initialFilter);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    const loadData = async () => {
      const data = await getUserHistory(user.id);
      setSessions(data);
      setLoading(false);
    };
    loadData();
  }, [user.id]);

  const filteredSessions = sessions.filter(s => {
      if (filter === 'pitch') return s.persona.id !== 'mentor';
      if (filter === 'mentor') return s.persona.id === 'mentor';
      return true;
  });

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('确定要删除这条历史记录吗？')) return;
    try {
      await deletePitchSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      // Dispatch event to update sidebar
      window.dispatchEvent(new Event('history-updated'));
    } catch (err) {
      alert('删除失败，请重试');
    }
  };

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto p-8 animate-pulse">
            <div className="h-8 bg-slate-800 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-800 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-violet-400" />
            路演历史
        </h2>
        
        <div className="flex bg-slate-800 p-1 rounded-xl">
            <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${filter === 'all' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <LayoutGrid className="w-4 h-4" /> 全部
            </button>
            <button 
                onClick={() => setFilter('pitch')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${filter === 'pitch' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <Target className="w-4 h-4" /> 结果
            </button>
            <button 
                onClick={() => setFilter('mentor')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${filter === 'mentor' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                <BookOpen className="w-4 h-4" /> 指导
            </button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
         <div className="text-center p-12">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">暂无历史记录</h2>
            <p className="text-slate-400">完成首次模拟后，这里会显示你的记录。</p>
        </div>
      ) : (
      <div className="grid gap-4">
        {filteredSessions.map((session) => {
            const isFunded = session.report?.funding_decision === 'Funded';
            const isIncomplete = !session.isCompleted || !session.report;
            return (
                <div 
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-2xl p-6 transition-all cursor-pointer flex items-center justify-between"
                >
                    <div className="flex items-center gap-6">
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isIncomplete
                            ? 'bg-violet-500/10 text-violet-400'
                            : (isFunded ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')
                        }`}>
                            {isIncomplete ? <Clock className="w-6 h-6" /> : (isFunded ? <Trophy className="w-6 h-6" /> : <XCircle className="w-6 h-6" />)}
                        </div>

                        {/* Details */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">{session.startup.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <span className={`w-2 h-2 rounded-full ${session.persona.color}`}></span>
                                    {session.persona.name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(session.date).toLocaleDateString()}
                                </span>
                                {isIncomplete && (
                                  <span className="px-2 py-0.5 text-xs rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                    未完成
                                  </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{isIncomplete ? '当前进度' : '得分'}</div>
                            {isIncomplete ? (
                              <div className="text-sm font-bold text-violet-300">进行中 · {Math.round(session.score)}%</div>
                            ) : (
                              <div className={`text-2xl font-bold ${
                                  session.score >= 70 ? 'text-emerald-400' : 
                                  session.score >= 40 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                                  {session.score}
                              </div>
                            )}
                        </div>
                        <button 
                            onClick={(e) => handleDelete(e, session.id)}
                            className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                            title="删除记录"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                </div>
            );
        })}
      </div>
      )}
    </div>
    </div>
  );
};
