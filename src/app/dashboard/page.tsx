'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck,
  Zap, ChevronRight, Loader2, Star, User, Activity, Shield, X
} from 'lucide-react';
import { analyzePolicy } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';

type InsightCard = {
  id: string;
  type: 'coverage' | 'exclusion' | 'risk';
  text: string;
};

const glassCard = {
  background: 'linear-gradient(135deg, rgba(14,14,22,0.90) 0%, rgba(18,12,36,0.94) 100%)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(99,130,255,0.12)',
  boxShadow: '0 0 60px rgba(59,130,246,0.05)',
};

export default function DashboardPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [deck, setDeck] = useState<InsightCard[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, cardId: string) => {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.offset.y) > 100) {
      setDeck(prev => prev.filter(c => c.id !== cardId));
    }
  };

  const processFile = async (selectedFile: File) => {
    setIsUploading(true);
    setErrorStr(null);
    setScore(null);
    setDeck([]);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const currentProfile = profile || { basicInfo: { age: 30 } };
        const uid = user?.uid || 'user_demo';

        const res = await analyzePolicy(
          uid,
          { inlineData: { data: base64, mimeType: 'application/pdf' } },
          currentProfile
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
          setErrorStr(res.error ?? 'Unknown error. Check your API key.');
        }
      } catch (e: any) {
        setErrorStr(e.message ?? 'Unexpected error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => { setErrorStr('Failed to read file.'); setIsUploading(false); };
    reader.readAsDataURL(selectedFile);
  };

  const cardColor = {
    coverage:  { bg: 'rgba(16,27,18,0.95)', border: 'rgba(34,197,94,0.3)',  glow: 'rgba(34,197,94,0.07)',  icon: 'text-emerald-400', iconBg: 'bg-emerald-500/15', label: 'Covered' },
    exclusion: { bg: 'rgba(28,12,12,0.95)', border: 'rgba(239,68,68,0.3)',  glow: 'rgba(239,68,68,0.07)',  icon: 'text-red-400',     iconBg: 'bg-red-500/15',     label: 'Excluded' },
    risk:      { bg: 'rgba(28,22,10,0.95)', border: 'rgba(234,179,8,0.3)',  glow: 'rgba(234,179,8,0.07)',  icon: 'text-amber-400',   iconBg: 'bg-amber-500/15',   label: 'Risk' },
  };

  const scoreColor = score === null ? '' : score >= 75 ? 'from-emerald-500 to-teal-400' : score >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400';
  const scoreLabel = score === null ? '' : score >= 75 ? 'Great coverage' : score >= 50 ? 'Average coverage' : 'Needs improvement';

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 lg:px-6 relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-blue-700/6 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-purple-700/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ── Top Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{displayName}</span> 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Upload a policy PDF to get your personalised analysis.</p>
          </div>

          {/* Quick stats row */}
          <div className="flex items-center gap-3">
            {[
              { icon: <User className="w-4 h-4" />, label: 'Age', value: profile?.basicInfo?.age || '—' },
              { icon: <Activity className="w-4 h-4" />, label: 'Risk', value: profile?.financial?.riskAppetite?.charAt(0) || '—' },
              { icon: <Shield className="w-4 h-4" />, label: 'Score', value: score !== null ? String(score) : '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm" style={glassCard}>
                <span className="text-blue-400">{icon}</span>
                <span className="text-gray-500 text-xs">{label}</span>
                <span className="font-bold text-white">{String(value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* LEFT: Upload / Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {deck.length === 0 ? (
              /* ── Upload Zone ── */
              <div
                className={`rounded-[2rem] transition-all duration-300 relative overflow-hidden min-h-[480px] flex flex-col items-center justify-center p-8 cursor-pointer group
                  ${isDragging ? 'scale-[1.01]' : ''}
                `}
                style={{
                  ...glassCard,
                  borderStyle: isDragging || file ? 'solid' : 'dashed',
                  borderColor: isDragging ? 'rgba(99,102,241,0.6)' : file ? 'rgba(59,130,246,0.3)' : 'rgba(100,130,255,0.18)',
                  boxShadow: isDragging ? '0 0 60px rgba(99,102,241,0.2)' : glassCard.boxShadow,
                }}
                onClick={() => !file && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f && f.type === 'application/pdf') { setFile(f); setErrorStr(null); }
                }}
              >
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center gap-5 text-center"
                    >
                      <div
                        className="w-24 h-24 rounded-3xl flex items-center justify-center transition-all group-hover:scale-105"
                        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 40px rgba(59,130,246,0.1)' }}
                      >
                        <Upload className="w-10 h-10 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Drop your policy PDF</h3>
                        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                          We use Gemini 2.5 Flash to dissect every clause and surface what matters to <em className="text-gray-400 not-italic font-semibold">you</em>.
                        </p>
                      </div>
                      <div
                        className="mt-2 px-8 py-3 rounded-full text-sm font-bold text-white group-hover:scale-105 transition-transform"
                        style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
                      >
                        Browse Files
                      </div>
                      <p className="text-xs text-gray-700 mt-1">or drag & drop here</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center gap-5 text-center w-full max-w-xs"
                    >
                      <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <FileText className="w-9 h-9 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
                      </div>

                      {errorStr && (
                        <div className="w-full p-4 rounded-2xl text-left text-xs text-red-400 bg-red-500/8 border border-red-500/20 whitespace-pre-wrap break-all">
                          {errorStr}
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.stopPropagation(); processFile(file); }}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
                      >
                        {isUploading
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing with Gemini…</>
                          : <><ShieldCheck className="w-5 h-5" /> Reveal My Coverage</>
                        }
                      </button>
                      {!isUploading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setFile(null); setErrorStr(null); }}
                          className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
                        >
                          Remove file
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setErrorStr(null); } }} />
              </div>
            ) : (
              /* ── Insight Deck ── */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">Insights Deck</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Swipe any card to dismiss · {deck.length} insight{deck.length !== 1 ? 's' : ''} left</p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setDeck([]); setScore(null); setErrorStr(null); }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-2 rounded-xl hover:bg-white/5 border border-white/5"
                  >
                    <X className="w-3.5 h-3.5" /> Start over
                  </button>
                </div>

                <div className="relative w-full h-[460px] flex items-center justify-center">
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
                            y: index * 16,
                            scale: 1 - index * 0.04,
                            zIndex: 50 - index,
                          }}
                          exit={{ opacity: 0, scale: 0.5, y: -140, transition: { duration: 0.22 } }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                          className="absolute w-full max-w-lg rounded-[2rem] p-8 flex flex-col select-none"
                          style={{
                            background: c.bg,
                            border: `1px solid ${c.border}`,
                            boxShadow: `0 0 60px ${c.glow}`,
                            backdropFilter: 'blur(32px)',
                            cursor: isTop ? 'grab' : 'default',
                            height: 300,
                          }}
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className={`p-2.5 rounded-xl ${c.iconBg}`}>
                              <IconEl className={`w-5 h-5 ${c.icon}`} />
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-widest ${c.icon}`}>{c.label}</span>
                          </div>

                          <p className="text-gray-100 text-base leading-relaxed flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
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
                      <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 mx-auto flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
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
          </motion.div>

          {/* RIGHT: Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            {/* Profile card */}
            <div className="rounded-[2rem] overflow-hidden" style={glassCard}>
              {/* Banner */}
              <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)' }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
              </div>

              <div className="px-6 pb-6">
                {/* Avatar overlapping the banner */}
                <div className="-mt-8 mb-4 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white relative z-10"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: '3px solid rgba(14,14,22,1)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                  {initials}
                </div>

                <h2 className="font-bold text-white text-lg leading-tight">{displayName}</h2>
                <p className="text-gray-500 text-xs truncate mb-5">{user?.email}</p>

                {/* Profile stats */}
                <div className="grid grid-cols-3 gap-2 text-center py-4 border-t border-white/6">
                  {[
                    { label: 'Age', value: profile?.basicInfo?.age ?? '—' },
                    { label: 'Deps', value: profile?.financial?.dependents ?? '0' },
                    { label: 'Risk', value: profile?.financial?.riskAppetite?.charAt(0) ?? '—' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-lg font-bold text-white">{String(s.value)}</div>
                      <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {!profile && (
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all"
                  >
                    Complete your profile →
                  </button>
                )}
              </div>
            </div>

            {/* Score card */}
            {score !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-[2rem] p-6 text-center"
                style={glassCard}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">SpashtAI Score</span>
                </div>
                <div className={`text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${scoreColor}`}>
                  {score}
                </div>
                <p className="text-xs text-gray-500 mb-4">{scoreLabel}</p>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${scoreColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-3">{deck.length} insights remaining</p>
              </motion.div>
            )}

            {/* Quick links */}
            <div className="rounded-[2rem] p-5" style={glassCard}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Quick Actions</p>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/simulator', label: 'Run Scenario Simulator', emoji: '⚡' },
                  { href: '/compare', label: 'Compare Two Policies', emoji: '⚖️' },
                ].map(({ href, label, emoji }) => (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 text-left transition-all group"
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
