import React, { useEffect, useState } from 'react';
import { PitchSession, User } from '../types';
import { getUserHistory } from '../services/storageService';
import { Calendar, ChevronRight, Trophy, XCircle, Clock, Search } from 'lucide-react';

interface Props {
  user: User;
  onSelectSession: (session: PitchSession) => void;
}

export const History: React.FC<Props> = ({ user, onSelectSession }) => {
  const [sessions, setSessions] = useState<PitchSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await getUserHistory(user.id);
      setSessions(data);
      setLoading(false);
    };
    loadData();
  }, [user.id]);

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

  if (sessions.length === 0) {
    return (
        <div className="max-w-4xl mx-auto p-12 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No History Yet</h2>
            <p className="text-slate-400">Complete your first simulation to see your records here.</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Clock className="w-8 h-8 text-violet-400" />
        Pitch History
      </h2>

      <div className="grid gap-4">
        {sessions.map((session) => {
            const isFunded = session.report?.funding_decision === 'Funded';
            return (
                <div 
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-2xl p-6 transition-all cursor-pointer flex items-center justify-between"
                >
                    <div className="flex items-center gap-6">
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                            isFunded ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                            {isFunded ? <Trophy className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
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
                            </div>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Score</div>
                            <div className={`text-2xl font-bold ${
                                session.score >= 70 ? 'text-emerald-400' : 
                                session.score >= 40 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                                {session.score}
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
