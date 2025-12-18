import React from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MarketingNavbar } from './components/MarketingNavbar';
import { AppSidebar } from './components/AppSidebar';
import { Footer } from './components/Footer';
import { Landing } from './components/Landing';
import { About } from './components/About';
import { Pricing } from './components/Pricing';
import { Auth } from './components/Auth';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { PitchPage } from './components/PitchPage';
import { LegalPage } from './components/Legal';
import { ApiDocs } from './components/ApiDocs';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { ViewState } from './types';
import { useUI } from './contexts/UIContext';

// Layout with Marketing Navbar
const MainLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col font-sans text-slate-100 selection:bg-violet-500/30">
      <MarketingNavbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout for the App (Chat)
const AppLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex font-sans text-slate-100 selection:bg-violet-500/30">
      <AppSidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }
  
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AuthPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  return <Auth onSuccess={(u) => { setUser(u); navigate('/app'); }} />;
};

const HistoryPage = () => {
  const { user } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null; // Should be handled by ProtectedRoute
  
  return (
    <History 
      user={user} 
      initialFilter={location.state?.filter}
      onSelectSession={(session) => {
        navigate(`/app/session/${session.id}`);
      }} 
    />
  );
};

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    if (!user) return null;
    
    return (
        <Profile 
            user={user} 
            onLogout={() => { logout(); navigate('/'); }} 
            onNavigate={(view, data) => {
                if (view === ViewState.HISTORY) {
                    navigate('/app/history', { state: { filter: data?.filter } });
                }
                if (view === ViewState.SETUP) navigate('/app');
                if (view === ViewState.PRICING) navigate('/pricing');
                if (view === ViewState.PITCHING && data?.sessionId) {
                    navigate(`/app/session/${data.sessionId}`);
                }
            }} 
        />
    );
}

const App: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing onStart={() => navigate('/login')} />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing onSubscribe={() => navigate('/login')} />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/privacy" element={<LegalPage title="隐私政策" type="privacy" />} />
        <Route path="/terms" element={<LegalPage title="服务条款" type="terms" />} />
        <Route path="/api-docs" element={<ApiDocs />} />
      </Route>

      {/* Protected App Routes */}
      <Route path="/app" element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
            <Route index element={<PitchPage />} />
            <Route path="session/:sessionId" element={<PitchPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
