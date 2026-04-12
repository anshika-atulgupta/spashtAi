'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'join'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem('spashtai_user', JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
      }));
      router.push('/onboarding');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 select-none">
      {/* Space glow behind the card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-indigo-600/8 blur-[140px]" />
      </div>

      {/* Levitating card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{
          opacity: { duration: 0.5 },
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
        }}
        className="w-full max-w-lg z-10 relative"
      >
        {/* Bottom shadow glow — gives floating illusion */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-blue-500/15 blur-2xl rounded-full pointer-events-none" />

        <div
          className="relative rounded-[2rem] overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(12,12,22,0.92) 0%, rgba(15,10,30,0.95) 100%)',
            backdropFilter: 'blur(48px)',
            WebkitBackdropFilter: 'blur(48px)',
            border: '1px solid rgba(100,130,255,0.12)',
            boxShadow: '0 0 80px rgba(59,130,246,0.08), 0 0 40px rgba(99,102,241,0.06)',
          }}
        >
          <div className="p-8 sm:p-12">

            {/* Close */}
            <Link href="/">
              <button className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors">
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </Link>

            {/* Logo mark */}
            <div className="flex items-center gap-2 mb-10">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-gray-400 tracking-widest uppercase">SpashtAI</span>
            </div>

            {/* Tabs */}
            <div className="flex items-end gap-6 mb-10 border-b border-white/5 pb-4">
              {(['signin', 'join'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="relative pb-1 text-2xl font-semibold transition-colors"
                  style={{ color: mode === m ? '#fff' : 'rgba(255,255,255,0.25)' }}
                >
                  {m === 'signin' ? 'Sign In' : 'Join'}
                  {mode === m && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute -bottom-4 left-0 w-full h-[2px] rounded-full bg-blue-500"
                      style={{ boxShadow: '0 0 8px rgba(59,130,246,0.8)' }}
                    />
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Fields */}
            <div className="space-y-5 mb-10">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-white/4 border border-white/8 text-white rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/6 transition-all placeholder:text-gray-700 text-sm"
                />
              </div>
              <div className="relative">
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 12 characters"
                  className="w-full bg-white/4 border border-white/8 text-white rounded-2xl px-5 py-4 pr-12 focus:outline-none focus:border-blue-500/50 focus:bg-white/6 transition-all placeholder:text-gray-700 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 bottom-4 text-gray-600 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 stroke-[1.5]" /> : <Eye className="w-5 h-5 stroke-[1.5]" />}
                </button>
              </div>
            </div>

            {/* Social auth row */}
            <div className="grid grid-cols-4 gap-3">
              {/* Google */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="h-14 col-span-4 sm:col-span-1 bg-white/4 border border-white/8 rounded-2xl flex items-center justify-center hover:border-white/20 hover:bg-white/6 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : (
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                )}
              </button>

              {/* Apple */}
              <button className="h-14 hidden sm:flex bg-white/4 border border-white/8 rounded-2xl items-center justify-center hover:border-white/20 hover:bg-white/6 transition-all">
                <svg fill="white" width="20" height="20" viewBox="0 0 24 24"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.947 1.14-1.662 1.609-3.272 1.637-3.356-.035-.015-3.14-1.205-3.167-4.802-.026-3.003 2.451-4.444 2.564-4.516-1.405-2.05-3.578-2.33-4.356-2.385-1.745-.16-3.52 1.04-4.57 1.04zm-.354-1.12c.797-.965 1.336-2.311 1.188-3.649-1.14.046-2.553.76-3.376 1.724-.658.745-1.282 2.13-.105 3.399C10.74 7.31 12.235 6.58 11.798 5.776z" /></svg>
              </button>

              {/* X/Twitter */}
              <button className="h-14 hidden sm:flex bg-white/4 border border-white/8 rounded-2xl items-center justify-center hover:border-white/20 hover:bg-white/6 transition-all">
                <svg fill="white" width="17" height="17" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </button>

              {/* Discord */}
              <button className="h-14 hidden sm:flex bg-white/4 border border-white/8 rounded-2xl items-center justify-center hover:border-indigo-500/40 hover:bg-indigo-500/8 transition-all">
                <svg fill="#5865F2" width="20" height="20" viewBox="0 0 127.14 96.36"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.73,67.73,0,0,1-10.87,5.19,77.13,77.13,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" /></svg>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-xs text-gray-600">or continue with email above</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            {/* Submit */}
            <button
              disabled={isLoading}
              className="w-full py-4 rounded-2xl font-semibold text-white transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 0 24px rgba(99,102,241,0.35)',
              }}
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
