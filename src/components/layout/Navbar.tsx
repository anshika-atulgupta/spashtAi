'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, ChevronDown, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-500"
      style={{
        background: scrolled
          ? 'rgba(5, 4, 15, 0.75)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(100,130,255,0.08)' : '1px solid transparent',
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
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400 font-medium">
          <Link href="/#about" className="hover:text-white transition-colors">About</Link>
          <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/simulator" className="hover:text-white transition-colors">Simulator</Link>
          <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <button className="px-5 py-2 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/6 transition-all border border-white/8">
              Sign In
            </button>
          </Link>
          <Link href="/login">
            <button
              className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                boxShadow: '0 0 18px rgba(99,102,241,0.35)',
              }}
            >
              Get Started
            </button>
          </Link>
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
            background: 'rgba(12,12,24,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(100,130,255,0.1)',
          }}
        >
          <div className="p-4 space-y-1">
            {['/#about', '/#features', '/dashboard', '/simulator', '/#faq'].map((href, i) => (
              <Link
                key={i}
                href={href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {href.replace('/#', '').replace('/', '') || 'Home'}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/5 flex gap-2">
              <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <button className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-300 border border-white/8 hover:bg-white/5 transition-all">Sign In</button>
              </Link>
              <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>Get Started</button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
