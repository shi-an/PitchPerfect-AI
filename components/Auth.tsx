import React, { useState, useEffect } from 'react';
import { login, register, requestPasswordReset } from '../services/authService';
import { User } from '../types';
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  onSuccess: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT';

export const Auth: React.FC<Props> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Clear errors when switching modes
  useEffect(() => {
    setGlobalError('');
    setFieldErrors({});
    setResetSent(false);
    setFormData({ name: '', email: '', password: '' });
  }, [mode]);

  // Calculate password strength
  useEffect(() => {
    if (mode === 'REGISTER') {
        const pass = formData.password;
        let score = 0;
        if (!pass) {
            setPasswordStrength(0);
            return;
        }
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++; // Special char
        setPasswordStrength(score);
    }
  }, [formData.password, mode]);

  const validate = () => {
    const errors: Record<string, string> = {};
    
    // Email Validation
    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // Register specific
    if (mode === 'REGISTER') {
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            errors.name = 'Name must be at least 2 characters';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }
    }
    
    // Login specific
    if (mode === 'LOGIN') {
        if (!formData.password) {
            errors.password = 'Password is required';
        }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setGlobalError('');

    try {
      if (mode === 'FORGOT') {
        await requestPasswordReset(formData.email);
        setResetSent(true);
      } else if (mode === 'LOGIN') {
        const user = await login(formData.email, formData.password);
        onSuccess(user);
      } else {
        const user = await register(formData.name, formData.email, formData.password);
        onSuccess(user);
      }
    } catch (err: any) {
      setGlobalError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({...prev, [field]: value}));
      // Clear specific field error on change
      if (fieldErrors[field]) {
          setFieldErrors(prev => {
              const newErrors = {...prev};
              delete newErrors[field];
              return newErrors;
          });
      }
  };

  // Success view for Forgot Password
  if (mode === 'FORGOT' && resetSent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-slate-400 mb-8">
            We've sent a password reset link to <span className="text-white font-medium">{formData.email}</span>.
          </p>
          <button
            onClick={() => setMode('LOGIN')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2">
          {mode === 'LOGIN' ? 'Welcome Back' : mode === 'REGISTER' ? 'Create Account' : 'Reset Password'}
        </h2>
        <p className="text-slate-400 mb-6">
          {mode === 'LOGIN' 
            ? 'Enter your details to access your pitch history.' 
            : mode === 'REGISTER' 
              ? 'Start your journey to funding mastery.'
              : 'Enter your email to receive a reset link.'}
        </p>

        {globalError && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'REGISTER' && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-1">
              <div className="relative">
                <UserIcon className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.name ? 'text-red-500' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full bg-slate-900 border rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all ${
                      fieldErrors.name 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' 
                      : 'border-slate-700 focus:ring-2 focus:ring-violet-500'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-400 text-xs pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-1">
            <div className="relative">
                <Mail className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.email ? 'text-red-500' : 'text-slate-500'}`} />
                <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all ${
                    fieldErrors.email 
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' 
                    : 'border-slate-700 focus:ring-2 focus:ring-violet-500'
                }`}
                />
            </div>
            {fieldErrors.email && (
                <p className="text-red-400 text-xs pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
                </p>
            )}
          </div>

          {mode !== 'FORGOT' && (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-1">
              <div className="relative">
                <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.password ? 'text-red-500' : 'text-slate-500'}`} />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className={`w-full bg-slate-900 border rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all ${
                      fieldErrors.password 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' 
                      : 'border-slate-700 focus:ring-2 focus:ring-violet-500'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
                </p>
              )}
              
              {/* Password Strength Indicator */}
              {mode === 'REGISTER' && formData.password && (
                <div className="pt-2 space-y-1.5">
                    <div className="flex gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map((level) => (
                            <div 
                                key={level}
                                className={`flex-1 rounded-full transition-colors duration-300 ${
                                    passwordStrength >= level 
                                    ? (passwordStrength <= 2 ? 'bg-red-500' : passwordStrength === 3 ? 'bg-amber-500' : 'bg-emerald-500') 
                                    : 'bg-slate-700'
                                }`} 
                            />
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Strength</span>
                        <span className={
                            passwordStrength <= 2 ? 'text-red-400' : 
                            passwordStrength === 3 ? 'text-amber-400' : 'text-emerald-400'
                        }>
                            {passwordStrength === 0 ? 'Too weak' : 
                             passwordStrength <= 2 ? 'Weak' : 
                             passwordStrength === 3 ? 'Medium' : 'Strong'}
                        </span>
                    </div>
                </div>
              )}
            </div>
          )}

          {mode === 'LOGIN' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('FORGOT')}
                className="text-sm text-violet-400 hover:text-violet-300"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                {mode === 'LOGIN' ? 'Sign In' : mode === 'REGISTER' ? 'Sign Up' : 'Send Reset Link'}
                {mode !== 'FORGOT' && <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          {mode === 'LOGIN' && (
            <>
              Don't have an account?{' '}
              <button onClick={() => setMode('REGISTER')} className="text-violet-400 hover:text-violet-300 font-medium">Register</button>
            </>
          )}
          {mode === 'REGISTER' && (
            <>
              Already have an account?{' '}
              <button onClick={() => setMode('LOGIN')} className="text-violet-400 hover:text-violet-300 font-medium">Login</button>
            </>
          )}
          {mode === 'FORGOT' && (
            <button onClick={() => setMode('LOGIN')} className="text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
