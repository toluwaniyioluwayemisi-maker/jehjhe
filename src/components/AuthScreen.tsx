import React, { useState } from 'react';
import {
  Milk,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from '../utils/firebase';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFriendlyErrorMessage = (rawError: unknown): string => {
    if (!rawError) return 'An unexpected error occurred. Please try again.';
    const msg = rawError instanceof Error ? rawError.message : String(rawError);

    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email address. Please sign in instead.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.includes('auth/popup-closed-by-user')) {
      return 'Sign-in popup was closed before completing. Please try again.';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('network-request-failed')) {
      return 'Network connection failure. Please check your internet connection.';
    }
    return msg.replace(/^Firebase:\s*/i, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password);
      }
      onAuthSuccess?.();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onAuthSuccess?.();
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 text-[#1C211E]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#45634D] text-[#F9F7F2] shadow-md ring-4 ring-[#E6EEE8]">
            <Milk className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C211E] font-display">
              Butch Master
            </h1>
            <p className="text-xs text-[#55635B] mt-1 font-medium tracking-wide">
              Commercial Yoghurt Production Costing & Inventory Engine
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-8 shadow-sm border border-[#E3DDD1] rounded-2xl">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#F0EBE1] p-1 mb-6 border border-[#E3DDD1]">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#1C211E] shadow-2xs'
                  : 'text-[#697A6F] hover:text-[#1C211E]'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#1C211E] shadow-2xs'
                  : 'text-[#697A6F] hover:text-[#1C211E]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-bold text-[#35433A] mb-1.5 uppercase tracking-wider"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8F82]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@butchmaster.com"
                  className="w-full pl-9.5 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D0C3] rounded-xl text-xs text-[#1C211E] placeholder-[#9E9689] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-bold text-[#35433A] mb-1.5 uppercase tracking-wider"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8F82]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9.5 pr-10 py-2.5 bg-[#FAF8F5] border border-[#D8D0C3] rounded-xl text-xs text-[#1C211E] placeholder-[#9E9689] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7C8F82] hover:text-[#1C211E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-bold text-[#35433A] mb-1.5 uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7C8F82]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8D0C3] rounded-xl text-xs text-[#1C211E] placeholder-[#9E9689] focus:outline-none focus:ring-2 focus:ring-[#45634D] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#45634D] hover:bg-[#38523F] text-white transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating workspace...'}</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In to Butch Master' : 'Create Account & Workspace'}</span>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E3DDD1]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#7C8F82] font-medium">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            id="auth-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-[#FAF8F5] text-[#1C211E] border border-[#D5DDD7] transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2.5 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Privacy & Isolation Guarantee */}
          <div className="mt-6 pt-4 border-t border-[#F0EBE1] flex items-center justify-center gap-1.5 text-[11px] text-[#697A6F]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#45634D]" />
            <span>Private & isolated workspace per business account</span>
          </div>
        </div>
      </div>
    </div>
  );
};
