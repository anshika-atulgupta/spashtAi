'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck,
  Zap, LogOut, ChevronRight, Loader2, Star
} from 'lucide-react';
import { analyzePolicy } from '@/app/actions';
import { useRouter } from 'next/navigation';

type InsightCard = {
  id: string;
  type: 'coverage' | 'exclusion' | 'risk';
  text: string;
};

// Space glass card style
const spaceCard = {
  background: 'linear-gradient(135deg, rgba(14,14,22,0.88) 0%, rgba(18,12,36,0.92) 100%)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(99,130,255,0.12)',
  boxShadow: '0 0 60px rgba(59,130,246,0.06)',
};

export default function DashboardPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [deck, setDeck] = useState<InsightCard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loginUser, setLoginUser] = useState<any>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem('spashtai_profile');
      if (p) setUserProfile(JSON.parse(p));
      const u = localStorage.getItem('spashtai_user');
      if (u) setLoginUser(JSON.parse(u));
    } catch {}
  }, []);

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, cardId: string) => {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.offset.y) > 100) {
      setDeck(prev => prev.filter(c => c.id !== cardId));
    }
  };

  const processFile = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorStr(null);
    setScore(null);
    setDeck([]);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const profile = userProfile || { basicInfo: { age: 30 } };
        const uid = loginUser?.uid || 'user_demo';

        const res = await analyzePolicy(
          uid,
          { inlineData: { data: base64, mimeType: 'application/pdf' } },
          profile
        );

        if (res.success && res.data) {
          setScore(res.data.score ?? 85);
          const cards: InsightCard[] = [
            ...(res.data.coverage ?? []).map((t: string, i: number) => ({ id: `c${i}`, type: 'coverage' as const, text: t })),
            ...(res.data.exclusions ?? []).map((t: string, i: number) => ({ id: `e${i}`, type: 'exclusion' as const, text: t })),
            ...(res.data.personalizedRisks ?? []).map((t: string, i: number) => ({ id: `r${i}`, type: 'risk' as const, text: t })),
          ].sort(() => Math.random() - 0.5);
          setDeck(cards);
        } else {
          setErrorStr(res.error ?? 'Unknown error. Check your API key and restart.');
        }
      } catch (e: any) {
        setErrorStr(e.message ?? 'Unexpected error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => { setErrorStr('Failed to read file.'); setIsUploading(false); };
    reader.readAsDataURL(file);
  };

  const cardColor = {
    coverage: { bg: 'rgba(17,28,18,0.9)', border: 'rgba(34,197,94,0.25)', glow: 'rgba(34,197,94,0.08)', icon: 'text-green-400', iconBg: 'bg-green-500/15' },
    exclusion: { bg: 'rgba(28,14,14,0.9)', border: 'rgba(239,68,68,0.25)', glow: 'rgba(239,68,68,0.08)', icon: 'text-red-400', iconBg: 'bg-red-500/15' },
    risk:      { bg: 'rgba(28,23,12,0.9)', border: 'rgba(234,179,8,0.25)',  glow: 'rgba(234,179,8,0.08)',  icon: 'text-yellow-400', iconBg: 'bg-yellow-500/15' },
  };

  return (
    <div className="min-h-screen px-4 py-8 relative">
      {/* Ambient glow */}
      <div className="fixed inset-0 flex items-start justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] rounded-full bg-blue-700/6 blur-[150px] translate-y-32" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 relative z-10">

        {/* ── Sidebar Profile ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-72 shrink-0 space-y-4"
        >
          {/* Profile card */}
          <div className="rounded-3xl overflow-hidden" style={spaceCard}>
            {/* Banner */}
            <div className="h-20 relative" style={{ background: 'linear-gradient(135deg, #1e3a8a, #4c1d95)' }}>
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
            </div>

            <div className="px-6 pb-6 -mt-10">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white border-4 mb-3"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', borderColor: '#05040f' }}>
                {loginUser?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>

              <h2 className="font-bold text-white text-lg leading-tight">{loginUser?.name ?? 'Guest User'}</h2>
              <p className="text-gray-500 text-sm mb-5 truncate">{loginUser?.email ?? 'Not signed in'}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center py-4 border-t border-white/5">
                {[
                  { label: 'Age', value: userProfile?.basicInfo?.age ?? '—' },
                  { label: 'Deps', value: userProfile?.financial?.dependents ?? '0' },
                  { label: 'Risk', value: userProfile?.financial?.riskAppetite?.charAt(0) ?? '—' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-base font-bold text-white">{String(s.value)}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-widest">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score card (shows after analysis) */}
          {score !== null && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl p-6 text-center" style={spaceCard}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-xs uppercase tracking-widest text-gray-500">SpashtAI Score</span>
              </div>
              <div className="text-6xl font-black mb-3" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {score}
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#2563eb,#7c3aed)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{deck.length} insights remaining</p>
            </motion.div>
          )}

          {/* Sign-out */}
          <button
            onClick={() => { localStorage.removeItem('spashtai_user'); router.push('/login'); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-red-400 hover:bg-red-500/8 transition-all border border-red-500/10"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>

        {/* ── Main Area ── */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">

          {/* Upload zone */}
          {deck.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-3xl flex-1 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden"
              style={{ ...spaceCard, border: file ? '1px solid rgba(59,130,246,0.3)' : '1px dashed rgba(100,130,255,0.15)' }}
            >
              {!file ? (
                /* Drop zone */
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.02] transition-all p-8 text-center"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
                >
                  <div className="w-20 h-20 rounded-2xl mb-6 flex items-center justify-center"
                    style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Drop your policy PDF</h3>
                  <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
                    We use Gemini 2.5 Flash to read and analyse your insurance document and surface what matters to <em>you</em>.
                  </p>
                  <div className="mt-8 px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
                    Browse Files
                  </div>
                </div>
              ) : (
                /* File selected state */
                <div className="flex flex-col items-center gap-5 w-full max-w-sm px-8 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>

                  {errorStr && (
                    <div className="w-full p-4 rounded-2xl text-left text-xs text-red-400 font-mono bg-red-500/8 border border-red-500/20 whitespace-pre-wrap break-all">
                      {errorStr}
                    </div>
                  )}

                  <button
                    onClick={processFile}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
                  >
                    {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing with Gemini…</> : <><ShieldCheck className="w-5 h-5" /> Reveal My Coverage</>}
                  </button>
                  {!isUploading && (
                    <button onClick={() => { setFile(null); setErrorStr(null); }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline">
                      Remove file
                    </button>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            </motion.div>
          )}

          {/* Swipeable insight deck */}
          {deck.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">Insights Deck</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Swipe any card to dismiss — {deck.length} left</p>
                </div>
                <button
                  onClick={() => { setFile(null); setDeck([]); setScore(null); setErrorStr(null); }}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline"
                >
                  Start over
                </button>
              </div>

              <div className="relative w-full h-[480px] flex items-center justify-center">
                <AnimatePresence>
                  {deck.slice(0, 3).map((card, index) => {
                    const c = cardColor[card.type];
                    const isTop = index === 0;
                    const IconEl = card.type === 'coverage' ? CheckCircle2 : card.type === 'exclusion' ? AlertTriangle : Zap;

                    return (
                      <motion.div
                        key={card.id}
                        drag={isTop}
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.85}
                        onDragEnd={(e, info) => handleDragEnd(e, info, card.id)}
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{
                          opacity: 1 - index * 0.18,
                          y: index * 18,
                          scale: 1 - index * 0.045,
                          zIndex: 50 - index,
                        }}
                        exit={{ opacity: 0, scale: 0.5, y: -160, transition: { duration: 0.22 } }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        className="absolute w-full max-w-md rounded-[2rem] p-8 flex flex-col"
                        style={{
                          background: c.bg,
                          border: `1px solid ${c.border}`,
                          boxShadow: `0 0 60px ${c.glow}`,
                          backdropFilter: 'blur(32px)',
                          cursor: isTop ? 'grab' : 'default',
                          height: 320,
                        }}
                      >
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`p-2.5 rounded-xl ${c.iconBg} ${c.icon}`}>
                            <IconEl className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{card.type}</span>
                        </div>

                        <p className="text-gray-100 text-base leading-relaxed flex-1 overflow-y-auto subtle-scrollbar">
                          {card.text}
                        </p>

                        {isTop && (
                          <div className="mt-4 pt-4 border-t border-white/6 flex items-center justify-between text-xs text-gray-600">
                            <span>← swipe to dismiss →</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {deck.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-green-500/15 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">All caught up!</h3>
                    <button onClick={() => { setFile(null); setDeck([]); setScore(null); }} className="text-sm text-gray-500 underline hover:text-gray-300">
                      Analyse another document
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
