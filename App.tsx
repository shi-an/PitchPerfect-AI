import React, { useState, useEffect } from 'react';
import { SetupScreen } from './components/Scanner'; 
import { PitchArena } from './components/Chat'; 
import { FeedbackReport } from './components/Dashboard'; 
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Landing } from './components/Landing';
import { About } from './components/About';
import { Auth } from './components/Auth';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { Pricing } from './components/Pricing';
import { ViewState, Persona, StartupDetails, PitchMessage, User, PitchReport, PitchSession } from './types';
import { startPitchSession } from './services/geminiService';
import { getCurrentUser, logout } from './services/authService';
import { savePitchSession } from './services/storageService';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [user, setUser] = useState<User | null>(null);
  
  // Pitch State
  const [persona, setPersona] = useState<Persona | null>(null);
  const [startup, setStartup] = useState<StartupDetails | null>(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [pitchHistory, setPitchHistory] = useState<PitchMessage[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [interestTrajectory, setInterestTrajectory] = useState<number[]>([]);
  const [initializing, setInitializing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // History Load State
  const [loadedReport, setLoadedReport] = useState<PitchReport | undefined>(undefined);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const handleStartPitch = async (p: Persona, s: StartupDetails) => {
    setPersona(p);
    setStartup(s);
    setInitializing(true);
    setLoadedReport(undefined); // Clear old report
    setInterestTrajectory([]);
    setCurrentSessionId(Date.now().toString());
    try {
      const intro = await startPitchSession(p, s);
      setInitialMessage(intro);
      setView(ViewState.PITCHING);
    } catch (e) {
      alert("连接投资人 AI 失败。");
      setView(ViewState.SETUP);
    } finally {
      setInitializing(false);
    }
  };

  const handleFinishPitch = (history: PitchMessage[], score: number, trajectory: number[]) => {
    setPitchHistory(history);
    setFinalScore(score);
    setInterestTrajectory(trajectory);
    setView(ViewState.REPORT);
  };

  // Called when FeedbackReport finishes generating (for a fresh pitch)
  const handleSaveSession = (report: PitchReport) => {
    if (!user || !persona || !startup) return;

    const newSession: PitchSession = {
        id: currentSessionId || Date.now().toString(),
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
    if (!user || !persona || !startup) return;
    const session: PitchSession = {
      id: currentSessionId || Date.now().toString(),
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
    setPersona(null);
    setStartup(null);
    setLoadedReport(undefined);
    setView(ViewState.SETUP);
  };
  
  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setView(ViewState.SETUP);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setView(ViewState.LANDING);
  };

  const handleLoadHistorySession = (session: PitchSession) => {
      setPersona(session.persona);
      setStartup(session.startup);
      setPitchHistory(session.messages);
      setFinalScore(session.score);
      setInterestTrajectory(session.interestTrajectory || []);
      setLoadedReport(session.report);
      setCurrentSessionId(session.id);
      if (session.isCompleted && session.report) {
        setView(ViewState.REPORT);
      } else {
        setInitialMessage(session.messages[0]?.text || "继续会议。");
        setView(ViewState.PITCHING);
      }
  };

  const renderContent = () => {
    if (initializing) {
      return (
         <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[60vh]">
           <Loader2 className="w-12 h-12 animate-spin text-violet-500 mb-4" />
           <p className="text-lg text-white font-medium">正在连接投资人...</p>
           <p className="text-sm">正在审阅你的路演材料</p>
         </div>
      );
    }

    switch (view) {
      case ViewState.LANDING:
        return <Landing onStart={() => setView(user ? ViewState.SETUP : ViewState.AUTH)} />;
      case ViewState.ABOUT:
        return <About />;
      case ViewState.PRICING:
        return <Pricing onSubscribe={() => setView(ViewState.AUTH)} />;
      case ViewState.AUTH:
        return <Auth onSuccess={handleAuthSuccess} />;
      case ViewState.SETUP:
        return <SetupScreen onStart={handleStartPitch} />;
      case ViewState.PITCHING:
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
            onExit={() => setView(ViewState.SETUP)}
            onProgress={handleProgressSave}
          />
        );
      case ViewState.REPORT:
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
      case ViewState.HISTORY:
        if (!user) return <Auth onSuccess={handleAuthSuccess} />;
        return <History user={user} onSelectSession={handleLoadHistorySession} />;
      case ViewState.PROFILE:
        if (!user) return <Auth onSuccess={handleAuthSuccess} />;
        return <Profile user={user} onLogout={handleLogout} onNavigate={setView} />;
      default:
        return <Landing onStart={() => setView(ViewState.AUTH)} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-violet-500/30">
      {/* Hide Nav/Footer when inside the Pitch Arena for immersion */}
      {view !== ViewState.PITCHING && (
        <Navbar 
          currentView={view} 
          setView={setView} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
      
      <main className="flex-1 flex flex-col">
        {renderContent()}
      </main>

      {view !== ViewState.PITCHING && <Footer />}
    </div>
  );
};

export default App;
