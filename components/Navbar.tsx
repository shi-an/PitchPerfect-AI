import React from 'react';
import { ViewState, User } from '../types';
import { Menu, X, Rocket, LogOut, User as UserIcon, History } from 'lucide-react';

interface Props {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ currentView, setView, user, onLogout }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const NavLink = ({ view, label, icon: Icon }: { view: ViewState, label: string, icon?: any }) => (
    <button
      onClick={() => {
        setView(view);
        setIsOpen(false);
      }}
      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
        currentView === view 
          ? 'bg-violet-600 text-white font-medium' 
          : 'text-slate-300 hover:text-white hover:bg-slate-800'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.LANDING)}>
            <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-2 rounded-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              PitchPerfect AI
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink view={ViewState.LANDING} label="Home" />
            <NavLink view={ViewState.ABOUT} label="About" />
            
            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
                <NavLink view={ViewState.HISTORY} label="History" icon={History} />
                
                <button 
                  onClick={() => setView(ViewState.PROFILE)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
                      currentView === ViewState.PROFILE 
                      ? 'bg-slate-800 border-violet-500' 
                      : 'border-transparent hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-700" />
                  <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">{user.name}</span>
                </button>
              </div>
            ) : (
              <NavLink view={ViewState.AUTH} label="Login / Register" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <NavLink view={ViewState.LANDING} label="Home" />
            <NavLink view={ViewState.ABOUT} label="About" />
            {user ? (
              <>
                <NavLink view={ViewState.HISTORY} label="History" icon={History} />
                <button
                    onClick={() => {
                        setView(ViewState.PROFILE);
                        setIsOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 mt-2 text-slate-300 hover:text-white"
                >
                  <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                  Profile ({user.name})
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink view={ViewState.AUTH} label="Login / Register" />
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
