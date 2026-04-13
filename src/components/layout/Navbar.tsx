'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, ShieldCheck, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/layout/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
    setIsOpen(false);
  };

  const NAV_LINKS = [
    { href: '/about', label: 'About' },
    { href: '/#features', label: 'Features' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/policy-insights', label: 'Policy Insights' },
    { href: '/simulator', label: 'Simulator' },
    { href: '/compare', label: 'Compare' },
  ];

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-500"
      style={{
        background: 'rgba(5, 4, 15, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(100,130,255,0.08)',
      }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SpashtAI</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-400 font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-white transition-colors whitespace-nowrap">
              {label}
            </Link>
          ))}
        </div>

        {/* CTA Buttons — auth-aware */}
        <div className="hidden md:flex items-center gap-3">
          {!loading && (
            user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/6 transition-all border border-white/8 cursor-pointer">
                    <User className="w-3.5 h-3.5" />
                    <span className="max-w-[120px] truncate">{user.displayName || user.email?.split('@')[0]}</span>
                  </div>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all border border-red-500/15"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-5 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/6 transition-all border border-white/8">
                    Sign In
                  </button>
                </Link>
                <Link href="/login">
                  <button
                    className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      boxShadow: '0 0 18px rgba(99,102,241,0.35)',
                    }}
                  >
                    Get Started
                  </button>
                </Link>
              </>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-400 hover:text-white p-2"
          onClick={() => setIsOpen(o => !o)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mx-4 mb-4 rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(8,8,20,0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(100,130,255,0.1)',
          }}
        >
          <div className="p-4 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/5 flex gap-2">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-red-400 border border-red-500/15 hover:bg-red-500/8 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-white/8 hover:bg-white/5 transition-all">Sign In</button>
                  </Link>
                  <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>Get Started</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
