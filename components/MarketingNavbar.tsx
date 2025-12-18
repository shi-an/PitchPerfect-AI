import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Rocket, ArrowRight } from 'lucide-react';

export const MarketingNavbar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, label }: { to: string, label: string }) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive(to)
          ? 'bg-slate-800 text-white font-medium' 
          : 'text-slate-300 hover:text-white hover:bg-slate-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-2 rounded-lg transition-transform group-hover:scale-110 shadow-lg shadow-violet-500/20">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent hidden sm:block">
              PitchPerfect AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" label="首页" />
            <NavLink to="/about" label="关于" />
            <NavLink to="/pricing" label="定价" />
            
            <div className="ml-4 pl-4 border-l border-slate-700">
              {user ? (
                <Link
                  to="/app"
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg transition-all shadow-lg shadow-violet-900/20 font-medium"
                >
                  进入控制台 <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-medium px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-3">
            {user ? (
                 <Link
                  to="/app"
                  className="text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  进入
                </Link>
            ) : (
                <Link
                    to="/login"
                    className="text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    登录
                </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white p-2 transition-transform active:scale-95"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-2">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <NavLink to="/" label="首页" />
            <NavLink to="/about" label="关于" />
            <NavLink to="/pricing" label="定价" />
          </div>
        </div>
      )}
    </nav>
  );
};
