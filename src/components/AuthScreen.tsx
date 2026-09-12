import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Copy,
  Check,
  Globe,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
} from '../utils/firebase';

interface AuthScreenProps {
  onAuthSuccess?: () => void;
  onExploreDemo?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onExploreDemo,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setIsInIframe(window.self !== window.top);
      } catch {
        setIsInIframe(true);
      }
    }
  }, []);

  const handleCopyHost = () => {
    if (!currentHost) return;
    navigator.clipboard.writeText(currentHost);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2500);
  };

  const getFriendlyErrorMessage = (rawError: unknown): string => {
    if (!rawError) return 'An unexpected error occurred. Please try again.';
    const msg = rawError instanceof Error ? rawError.message : String(rawError);

    if (msg.includes('auth/unauthorized-domain') || msg.includes('not authorized for OAuth') || msg.includes('unauthorized domain')) {
      setIsUnauthorizedDomain(true);
      return `Domain "${currentHost}" is not authorized for OAuth operations in Firebase. Add this domain to Authorized Domains in Firebase Console, or continue with Demo Mode.`;
    }
    if (msg.includes('auth/operation-not-allowed') || msg.includes('OPERATION_NOT_ALLOWED')) {
      return 'Email/Password sign-in is not enabled in Firebase Console for this project. Please use "Continue with Google", or explore in Demo Mode.';
    }
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'An account already exists with this email address. Please sign in instead.';
    }
    if (msg.includes('auth/weak-password')) {
      return 'Password must be at least 6 characters long.';
    }
    if (msg.includes('auth/popup-blocked')) {
      return 'Authentication popup was blocked by your browser. Please allow popups or open the app in a new tab.';
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
    setIsUnauthorizedDomain(false);

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
    setIsUnauthorizedDomain(false);
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

  const handleOpenInNewWindow = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 text-[#1C211E]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
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

        {/* Return to Workspace / Offline Mode Shortcut */}
        {onExploreDemo && (
          <div className="flex justify-center sm:justify-start mb-2">
            <button
              id="auth-back-to-app-btn"
              type="button"
              onClick={onExploreDemo}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#45634D] hover:text-[#1E2E23] bg-[#E8EFEA] hover:bg-[#DDE7DF] px-3 py-1.5 rounded-lg border border-[#C5D7C9] transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue in Offline / Demo Mode (No Login)</span>
            </button>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white py-7 px-6 sm:px-8 shadow-sm border border-[#E3DDD1] rounded-2xl space-y-5">
          {/* Primary Recommended: Google Sign-In */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#35433A] uppercase tracking-wider">
                Recommended Sign-In
              </span>
              <span className="text-[10px] font-semibold text-[#2E5738] bg-[#EBF3ED] px-2 py-0.5 rounded-full">
                Firebase OAuth
              </span>
            </div>

            <button
              id="auth-google-primary-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-[#1C211E] hover:bg-[#2C3430] text-white transition-all cursor-pointer shadow-xs flex items-center justify-center gap-3 disabled:opacity-60"
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
              <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
            </button>
          </div>

          {/* Unauthorized Domain Diagnostic Card */}
          {isUnauthorizedDomain && (
            <div className="p-3.5 rounded-xl bg-[#FFF9F2] border border-[#FAD9B5] text-[#7A3F14] text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-[#A85A1D] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-[#6D340C]">Authorized Domain Diagnostic</h4>
                  <p className="text-[11px] text-[#7A3F14] leading-relaxed">
                    Firebase Authentication requires this exact hostname in your project settings:
                  </p>
                </div>
              </div>

              {/* Hostname with copy button */}
              <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-lg border border-[#E6CCA8] font-mono text-[11px] text-[#2C1D0F]">
                <span className="truncate flex-1 px-1">{currentHost || 'ais-pre-...run.app'}</span>
                <button
                  type="button"
                  onClick={handleCopyHost}
                  className="px-2 py-1 bg-[#F5ECE0] hover:bg-[#EBDDCB] text-[#5C3210] rounded text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Copy hostname to clipboard"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                {isInIframe && (
                  <button
                    type="button"
                    onClick={handleOpenInNewWindow}
                    className="px-2.5 py-1.5 bg-[#45634D] hover:bg-[#38523F] text-white rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open in New Tab</span>
                  </button>
                )}

                {onExploreDemo && (
                  <button
                    type="button"
                    onClick={onExploreDemo}
                    className="px-2.5 py-1.5 bg-[#F5ECE0] hover:bg-[#EBDDCB] text-[#5C3210] rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#9A5B2D]" />
                    <span>Explore in Demo Mode</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {error && !isUnauthorizedDomain && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="leading-relaxed block">{error}</span>
                {isInIframe && error.includes('popup') && (
                  <button
                    type="button"
                    onClick={handleOpenInNewWindow}
                    className="inline-flex items-center gap-1 font-bold underline hover:text-black cursor-pointer text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open App in Standalone Tab
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Social Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E3DDD1]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#7C8F82] font-medium">Or sign in with email</span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#F0EBE1] p-1 border border-[#E3DDD1]">
            <button
              id="auth-tab-signin"
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#1C211E] shadow-2xs'
                  : 'text-[#697A6F] hover:text-[#1C211E]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#45634D] hover:bg-[#38523F] text-white transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating workspace...'}</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign In with Email' : 'Create Email Account'}</span>
              )}
            </button>
          </form>

          {/* Explore Demo Mode Alternative */}
          {onExploreDemo && (
            <div className="pt-2 border-t border-[#F0EBE1]">
              <button
                id="auth-explore-demo-btn"
                type="button"
                onClick={onExploreDemo}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#FAF6F0] hover:bg-[#F2ECE1] text-[#8C4E20] border border-[#E6DAC8] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#9A5B2D]" />
                <span>Explore Butch Master in Demo Mode (No Login)</span>
              </button>
            </div>
          )}

          {/* Privacy & Isolation Guarantee */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#697A6F]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#45634D]" />
            <span>Private & isolated workspace per business account</span>
          </div>
        </div>
      </div>
    </div>
  );
};
