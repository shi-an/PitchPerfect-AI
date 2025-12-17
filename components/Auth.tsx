import React, { useState, useEffect } from 'react';
import { login, register, requestPasswordReset, confirmPasswordReset } from '../services/authService';
import { User } from '../types';
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  onSuccess: (user: User) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'RESET';

export const Auth: React.FC<Props> = ({ onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
    setResetCompleted(false);
    setResetToken('');
    setConfirmPassword('');
    setFormData({ name: '', email: '', password: '' });
  }, [mode]);

  // Auto-detect URL token and switch to RESET
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('resetToken');
    if (token) {
      setResetToken(token);
      setMode('RESET');
    }
  }, []);

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
    
    // Email Validation (not required in RESET)
    if (mode !== 'RESET') {
      if (!formData.email) {
        errors.email = '邮箱为必填项';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = '请输入有效的邮箱地址';
      }
    }

    // Register specific
    if (mode === 'REGISTER') {
      if (!formData.name.trim()) {
        errors.name = '姓名为必填项';
      } else if (formData.name.length < 2) {
        errors.name = '姓名至少 2 个字符';
      }

      if (!formData.password) {
        errors.password = '密码为必填项';
      } else if (formData.password.length < 8) {
        errors.password = '密码至少 8 个字符';
      }
    }
    
    // Login specific
    if (mode === 'LOGIN') {
      if (!formData.password) {
        errors.password = '密码为必填项';
      }
    }

    // Reset specific
    if (mode === 'RESET') {
      if (!resetToken.trim()) {
        errors.resetToken = '重置码为必填项';
      }
      if (!formData.password) {
        errors.password = '新密码为必填项';
      } else if (formData.password.length < 8) {
        errors.password = '新密码至少 8 个字符';
      }
      if (!confirmPassword) {
        errors.confirmPassword = '请再次确认新密码';
      } else if (confirmPassword !== formData.password) {
        errors.confirmPassword = '两次输入的密码不一致';
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
      } else if (mode === 'RESET') {
        await confirmPasswordReset(resetToken, formData.password);
        setResetCompleted(true);
      } else if (mode === 'LOGIN') {
        const user = await login(formData.email, formData.password);
        onSuccess(user);
      } else {
        const user = await register(formData.name, formData.email, formData.password);
        onSuccess(user);
      }
    } catch (err: any) {
      setGlobalError(err.message || '认证失败');
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
          <h2 className="text-2xl font-bold text-white mb-2">请查收邮箱</h2>
          <p className="text-slate-400 mb-8">
            我们已向 <span className="text-white font-medium">{formData.email}</span> 发送密码重置链接。
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setMode('RESET')}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              前往设置新密码
            </button>
            <button
              onClick={() => setMode('LOGIN')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              返回登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success view for Reset Confirm
  if (mode === 'RESET' && resetCompleted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">密码已更新</h2>
          <p className="text-slate-400 mb-8">
            你的密码已成功重置，请使用新密码登录。
          </p>
          <button
            onClick={() => setMode('LOGIN')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4 py-12">
  <div className="w-full max-w-md bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-xl">
    <h2 className="text-2xl font-bold text-white mb-2">
      {mode === 'LOGIN' ? '欢迎回来' : mode === 'REGISTER' ? '创建账号' : mode === 'FORGOT' ? '重置密码' : '设置新密码'}
    </h2>
    <p className="text-slate-400 mb-6">
      {mode === 'LOGIN' 
        ? '输入你的信息以访问路演历史。' 
        : mode === 'REGISTER' 
          ? '开启你的融资掌握之旅。'
          : mode === 'FORGOT'
            ? '输入邮箱以接收重置链接。'
            : '输入重置码并设置新密码。'}
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
              placeholder="姓名"
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
      
      {mode !== 'RESET' && (
        <div className="space-y-1">
          <div className="relative">
              <Mail className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.email ? 'text-red-500' : 'text-slate-500'}`} />
              <input
              type="email"
              placeholder="邮箱地址"
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
      )}

      {(mode === 'LOGIN' || mode === 'REGISTER') && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-1">
          <div className="relative">
            <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.password ? 'text-red-500' : 'text-slate-500'}`} />
            <input
              type="password"
              placeholder="密码"
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
                    <span>强度</span>
                    <span className={
                        passwordStrength <= 2 ? 'text-red-400' : 
                        passwordStrength === 3 ? 'text-amber-400' : 'text-emerald-400'
                    }>
                        {passwordStrength === 0 ? '太弱' : 
                         passwordStrength <= 2 ? '弱' : 
                         passwordStrength === 3 ? '中等' : '强'}
                    </span>
                </div>
            </div>
          )}
        </div>
      )}

      {mode === 'RESET' && (
        <>
          <div className="space-y-1">
            <div className="relative">
              <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.resetToken ? 'text-red-500' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="重置码（邮件中的令牌）"
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all ${
                  fieldErrors.resetToken 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' 
                  : 'border-slate-700 focus:ring-2 focus:ring-violet-500'
                }`}
              />
            </div>
            {fieldErrors.resetToken && (
              <p className="text-red-400 text-xs pl-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.resetToken}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.password ? 'text-red-500' : 'text-slate-500'}`} />
              <input
                type="password"
                placeholder="新密码"
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
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${fieldErrors.confirmPassword ? 'text-red-500' : 'text-slate-500'}`} />
              <input
                type="password"
                placeholder="确认新密码"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full bg-slate-900 border rounded-xl py-3 pl-10 pr-4 text-white outline-none transition-all ${
                  fieldErrors.confirmPassword 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/50' 
                  : 'border-slate-700 focus:ring-2 focus:ring-violet-500'
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-xs pl-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.confirmPassword}
              </p>
            )}
          </div>
        </>
      )}

      {mode === 'LOGIN' && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setMode('FORGOT')}
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            忘记密码？
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
            {mode === 'LOGIN' ? '登录' : mode === 'REGISTER' ? '注册' : mode === 'FORGOT' ? '发送重置链接' : '确认重置'}
            {mode !== 'FORGOT' && <ArrowRight className="w-4 h-4" />}
          </>
        )}
      </button>
    </form>

    <div className="mt-6 text-center text-sm text-slate-400">
      {mode === 'LOGIN' && (
        <>
          还没有账号？{' '}
          <button onClick={() => setMode('REGISTER')} className="text-violet-400 hover:text-violet-300 font-medium">注册</button>
        </>
      )}
      {mode === 'REGISTER' && (
        <>
          已有账号？{' '}
          <button onClick={() => setMode('LOGIN')} className="text-violet-400 hover:text-violet-300 font-medium">登录</button>
        </>
      )}
      {mode === 'FORGOT' && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setMode('RESET')} className="text-violet-400 hover:text-violet-300 font-medium">我已有重置码</button>
          <button onClick={() => setMode('LOGIN')} className="text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> 返回登录
          </button>
        </div>
      )}
      {mode === 'RESET' && (
        <button onClick={() => setMode('FORGOT')} className="text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> 返回邮箱重置
        </button>
      )}
    </div>
  </div>
    </div>
  );
};
