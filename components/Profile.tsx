import React, { useEffect, useState } from 'react';
import { User, PitchSession, ViewState } from '../types';
import { getUserHistory } from '../services/storageService';
import { Trophy, Target, Activity, Clock, LogOut, User as UserIcon, Calendar, ArrowRight, TrendingUp } from 'lucide-react';

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

  if (loading) {
     return <div className="p-12 text-center text-slate-500">Loading profile data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-800 bg-slate-700" />
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900" title="Online"></div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
              <span className="flex items-center gap-1"><UserIcon className="w-4 h-4" /> Founder</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined 2024</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="px-6 py-3 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 rounded-xl transition-all flex items-center gap-2 border border-slate-700"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-violet-500/50 transition-colors">
            <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center mb-3">
               <Activity className="w-5 h-5 text-violet-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Pitches</div>
        </div>
        
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-emerald-500/50 transition-colors">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-3">
               <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.fundedRate}%</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Funding Rate</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-amber-500/50 transition-colors">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-3">
               <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.highestScore}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">High Score</div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-colors">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
               <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.avgScore}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Avg Score</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
           <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold text-white">Recent Activity</h2>
             <button 
                onClick={() => onNavigate(ViewState.HISTORY)}
                className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
             >
                View All <ArrowRight className="w-4 h-4" />
             </button>
           </div>
           
           {recent.length === 0 ? (
               <div className="p-8 border border-slate-800 rounded-2xl text-center text-slate-500 bg-slate-900/30">
                  No simulations yet. Start your first pitch!
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
                                  <p className="text-xs text-slate-500">vs {session.persona.name} • {new Date(session.date).toLocaleDateString()}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-white">{session.score}</div>
                              <div className="text-xs text-slate-500">Score</div>
                          </div>
                      </div>
                  ))}
               </div>
           )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-center">
                <h3 className="text-white font-bold text-lg mb-2">Start New Simulation</h3>
                <p className="text-white/80 text-sm mb-6">Ready to improve your score? Jump back into the arena.</p>
                <button 
                    onClick={() => onNavigate(ViewState.SETUP)}
                    className="w-full bg-white text-violet-700 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
                >
                    Start Pitching
                </button>
            </div>
            
             <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Account Stats</h3>
                <div className="space-y-3 text-sm text-slate-400">
                    <div className="flex justify-between">
                        <span>Plan</span>
                        <span className="text-white font-medium">Free Tier</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Daily Credits</span>
                        <span className="text-white font-medium">5/5</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Member ID</span>
                        <span className="text-white font-mono text-xs">#{user.id.slice(0,8)}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
