import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SetupScreen } from './Scanner';
import { PitchArena } from './Chat';
import { FeedbackReport } from './Dashboard';
import { Persona, StartupDetails, PitchMessage, PitchSession, PitchReport } from '../types';
import { startPitchSession } from '../services/geminiService';
import { savePitchSession, getPitchSession, getUserHistory } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { Loader2 } from 'lucide-react';

enum PitchView {
  SETUP,
  PITCHING,
  REPORT
}

export const PitchPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useUI();
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<PitchView>(PitchView.SETUP);
  
  // Pitch State
  const [persona, setPersona] = useState<Persona | null>(null);
  const [startup, setStartup] = useState<StartupDetails | null>(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [pitchHistory, setPitchHistory] = useState<PitchMessage[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [interestTrajectory, setInterestTrajectory] = useState<number[]>([]);
  const [initializing, setInitializing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  
  // Loaded Report State
  const [loadedReport, setLoadedReport] = useState<PitchReport | undefined>(undefined);

  // Effect to load session if ID is present
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    } else {
      resetState();
    }
  }, [sessionId]);

  const resetState = () => {
    setPersona(null);
    setStartup(null);
    setPitchHistory([]);
    setFinalScore(0);
    setInterestTrajectory([]);
    setLoadedReport(undefined);
    setCurrentSessionId(null);
    setView(PitchView.SETUP);
  };

  const loadSession = async (id: string) => {
    setLoadingSession(true);
    try {
      const session = await getPitchSession(id);
      if (session) {
        setPersona(session.persona);
        setStartup(session.startup);
        setPitchHistory(session.messages);
        setFinalScore(session.score);
        setInterestTrajectory(session.interestTrajectory || []);
        setLoadedReport(session.report);
        setCurrentSessionId(session.id);
        
        if (session.isCompleted && session.report) {
          setView(PitchView.REPORT);
        } else {
          setInitialMessage(session.messages[0]?.text || '');
          setView(PitchView.PITCHING);
        }
      } else {
        // Session not found, redirect to new
        navigate('/app');
      }
    } catch (e) {
      console.error(e);
      navigate('/app');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleStartPitch = async (p: Persona, s: StartupDetails) => {
    // Check Daily Limit for FREE users (Mentor is always free)
    if (user?.plan === 'FREE' && p.id !== 'mentor') {
        try {
            const history = await getUserHistory(user.id);
            const today = new Date().toISOString().split('T')[0];
            const todaySessions = history.filter(sess => 
                sess.date.startsWith(today) && sess.persona.id !== 'mentor'
            );
            
            if (todaySessions.length >= 3) {
                const confirmed = await toast.info('今日 AI 投资人路演次数已达上限（3次）。升级套餐以解锁无限次路演。');
                navigate('/pricing');
                return;
            }
        } catch (e) {
            console.error("Failed to check limits", e);
        }
    }

    setPersona(p);
    setStartup(s);
    setInitializing(true);
    setLoadedReport(undefined);
    setInterestTrajectory([]);
    
    // Create ID immediately
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
    
    try {
      const intro = await startPitchSession(p, s);
      setInitialMessage(intro);
      
      // Save initial state so it appears in history immediately?
      // Or just navigate?
      // Let's navigate to the URL so the sidebar updates active state
      // But we need to save first, otherwise loadSession will fail
      
      const initialSession: PitchSession = {
          id: newId,
          userId: user?.id || '',
          date: new Date().toISOString(),
          startup: s,
          persona: p,
          messages: [{ id: 'init', role: 'model', text: intro }],
          score: 50,
          interestTrajectory: [50],
          isCompleted: false
      };
      await savePitchSession(initialSession);
      
      // Now navigate
      navigate(`/app/session/${newId}`);
      // The useEffect will trigger loadSession, which is fine, but slightly redundant.
      // Optimization: We could set state locally and replace URL without triggering reload if we handle it carefully.
      // But for simplicity, letting the router drive the state is safer.
      
    } catch (e) {
      toast.error("连接投资人 AI 失败。");
      setView(PitchView.SETUP);
    } finally {
      setInitializing(false);
    }
  };

  const handleFinishPitch = (history: PitchMessage[], score: number, trajectory: number[]) => {
    setPitchHistory(history);
    setFinalScore(score);
    setInterestTrajectory(trajectory);
    setView(PitchView.REPORT);
  };

  const handleSaveSession = (report: PitchReport) => {
    if (!user || !persona || !startup || !currentSessionId) return;

    const newSession: PitchSession = {
        id: currentSessionId,
        userId: user.id,
        date: new Date().toISOString(),
        startup,
        persona,
        messages: pitchHistory,
        score: finalScore,
        interestTrajectory,
        report,
        isCompleted: true
    };
    
    savePitchSession(newSession);
  };

  const handleProgressSave = (history: PitchMessage[], score: number, trajectory: number[]) => {
    if (!user || !persona || !startup || !currentSessionId) return;
    const session: PitchSession = {
      id: currentSessionId,
      userId: user.id,
      date: new Date().toISOString(),
      startup,
      persona,
      messages: history,
      score,
      interestTrajectory: trajectory,
      isCompleted: false
    };
    savePitchSession(session);
  };

  const handleRestart = () => {
    navigate('/app');
  };

  if (initializing || loadingSession) {
    return (
       <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[60vh]">
         <Loader2 className="w-12 h-12 animate-spin text-violet-500 mb-4" />
         <p className="text-lg text-white font-medium">
            {initializing ? '正在连接投资人...' : '正在恢复会议...'}
         </p>
       </div>
    );
  }

  switch (view) {
    case PitchView.SETUP:
      return <SetupScreen onStart={handleStartPitch} />;
    case PitchView.PITCHING:
      if (!persona || !startup) return <SetupScreen onStart={handleStartPitch} />;
      return (
        <PitchArena 
          persona={persona} 
          startup={startup} 
          initialMessage={initialMessage}
          initialHistory={pitchHistory.length > 0 ? pitchHistory : undefined}
          initialScore={finalScore || undefined}
          initialTrajectory={interestTrajectory.length > 0 ? interestTrajectory : undefined}
          onFinish={handleFinishPitch}
          onExit={() => navigate('/app')}
          onProgress={handleProgressSave}
        />
      );
    case PitchView.REPORT:
      return (
        <FeedbackReport 
          messages={pitchHistory} 
          finalScore={finalScore} 
          interestTrajectory={interestTrajectory}
          onRestart={handleRestart}
          existingReport={loadedReport}
          onReportGenerated={handleSaveSession}
        />
      );
    default:
      return <SetupScreen onStart={handleStartPitch} />;
  }
};
