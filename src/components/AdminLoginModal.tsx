import React, { useState } from 'react';
import { ElgiLogo } from './ElgiLogo';
import { Lock, Shield, Eye, EyeOff, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Standard institutional admin credentials (support both 'admin' / 'admin123' and 'elgi' / 'elgi2024')
    const valid =
      (username.trim().toLowerCase() === 'admin' && (password === 'admin' || password === 'admin123' || password === 'elgi2024')) ||
      (username.trim().toLowerCase() === 'elgi' && (password === 'admin' || password === 'elgi2024' || password === 'admin123'));

    if (valid) {
      localStorage.setItem('elgi_admin_authenticated', 'true');
      onSuccess();
      onClose();
    } else {
      setError('Invalid administrator credentials. Please check your username and password.');
    }
  };

  const handleQuickDemoFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-blue-900/20 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ElgiLogo className="w-12 h-12" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 block">
                e-Learning GROUP INSTITUTE
              </span>
              <h3 className="text-base font-bold text-blue-950">
                ELGI Faculty Admin Sign-In
              </h3>
              <p className="text-xs text-slate-500">
                Authorized staff & examination board access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
          Sign in to create, edit, or delete questions, set answer keys, modify student scores, and manage portal grading policies.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Password / Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-blue-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <KeyRound className="w-3 h-3 text-amber-500" />
              Fill default admin credentials (admin / admin123)
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Sign In as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
