'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ShieldCheck,
  Zap, ChevronRight, Loader2, Star, X, Info, TrendingUp,
  BarChart3, ArrowRight, Sparkles
} from 'lucide-react';
import { analyzePolicy } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';

type InsightCard = {
  id: string;
  type: 'coverage' | 'exclusion' | 'risk';
  text: string;
};

type ScoreBreakdown = {
  coverage: number;
  exclusions: number;
  userFit: number;
  affordability: number;
  claimEase: number;
};

type KeyFacts = {
  sumInsured?: string;
  policyType?: string;
  networkHospitals?: string;
  waitingPeriod?: string;
  renewability?: string;
};

type AnalysisResult = {
  policyName: string;
  score: number;
  scoreBreakdown: ScoreBreakdown;
  scoreReason: string;
  improvements: string[];
  coverage: string[];
  exclusions: string[];
  personalizedRisks: string[];
  keyFacts: KeyFacts;
};

const glassCard = {
  background: 'linear-gradient(135deg, rgba(14,14,22,0.90) 0%, rgba(18,12,36,0.94) 100%)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(99,130,255,0.12)',
  boxShadow: '0 0 60px rgba(59,130,246,0.05)',
};

const categoryConfig = {
  coverage: {
    bg: 'rgba(16,27,18,0.95)', border: 'rgba(34,197,94,0.25)', glow: 'rgba(34,197,94,0.06)',
    icon: 'text-emerald-400', iconBg: 'bg-emerald-500/15', label: 'Covered',
    headerBg: 'linear-gradient(135deg,rgba(16,27,18,0.98),rgba(20,40,22,0.98))',
    dot: '#22c55e', IconEl: CheckCircle2,
  },
  exclusion: {
    bg: 'rgba(28,12,12,0.95)', border: 'rgba(239,68,68,0.25)', glow: 'rgba(239,68,68,0.06)',
    icon: 'text-red-400', iconBg: 'bg-red-500/15', label: 'Excluded',
    headerBg: 'linear-gradient(135deg,rgba(28,12,12,0.98),rgba(40,16,16,0.98))',
    dot: '#ef4444', IconEl: AlertTriangle,
  },
  risk: {
    bg: 'rgba(28,22,10,0.95)', border: 'rgba(234,179,8,0.25)', glow: 'rgba(234,179,8,0.06)',
    icon: 'text-amber-400', iconBg: 'bg-amber-500/15', label: 'Your Risks',
    headerBg: 'linear-gradient(135deg,rgba(28,22,10,0.98),rgba(40,30,12,0.98))',
    dot: '#eab308', IconEl: Zap,
  },
};

function ScoreBreakdownModal({
  open, onClose, score, breakdown, reason, improvements, policyName
}: {
  open: boolean; onClose: () => void; score: number; breakdown: ScoreBreakdown;
  reason: string; improvements: string[]; policyName: string;
}) {
  const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';
  const scoreGradient = score >= 75 ? 'from-emerald-500 to-teal-400' : score >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400';

  const breakdownItems = [
    { label: 'Coverage Depth', key: 'coverage', icon: ShieldCheck },
    { label: 'Low Exclusions', key: 'exclusions', icon: CheckCircle2 },
    { label: 'Profile Fit', key: 'userFit', icon: Sparkles },
    { label: 'Affordability', key: 'affordability', icon: BarChart3 },
    { label: 'Claim Ease', key: 'claimEase', icon: TrendingUp },
  ] as const;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-lg rounded-[2rem] p-7 relative overflow-hidden"
            style={glassCard}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-amber-500/15">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">SpashtAI Score</p>
                <p className="text-white font-bold text-sm truncate max-w-[260px]">{policyName}</p>
              </div>
              <div className={`ml-auto text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${scoreGradient}`}>
                {score}
              </div>
            </div>

            {/* Reason */}
            <div className="mb-5 p-4 rounded-2xl bg-white/4 border border-white/7">
              <p className="text-gray-300 text-sm leading-relaxed">{reason}</p>
            </div>

            {/* Score Breakdown */}
            <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-3">Score Breakdown</p>
            <div className="space-y-3 mb-6">
              {breakdownItems.map(({ label, key, icon: Icon }) => {
                const val = breakdown?.[key] ?? 0;
                const barColor = val >= 70 ? '#22c55e' : val >= 45 ? '#eab308' : '#ef4444';
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: barColor }}>{val}/100</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Improvements */}
            {improvements?.length > 0 && (
              <>
                <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-3">How to Improve Your Score</p>
                <div className="space-y-2">
                  {improvements.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/7 border border-blue-500/15">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-300 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CategoryColumn({ type, cards }: { type: 'coverage' | 'exclusion' | 'risk'; cards: InsightCard[] }) {
  const cfg = categoryConfig[type];
  const { IconEl } = cfg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: type === 'coverage' ? 0.05 : type === 'exclusion' ? 0.1 : 0.15 }}
      className="flex flex-col rounded-[1.5rem] overflow-hidden h-full"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, boxShadow: `0 0 40px ${cfg.glow}` }}
    >
      {/* Column Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: cfg.headerBg, borderBottom: `1px solid ${cfg.border}` }}>
        <div className={`p-2 rounded-lg ${cfg.iconBg}`}>
          <IconEl className={`w-4 h-4 ${cfg.icon}`} />
        </div>
        <span className={`text-sm font-bold uppercase tracking-widest ${cfg.icon}`}>{cfg.label}</span>
        <span className="ml-auto text-xs font-semibold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{cards.length}</span>
      </div>

      {/* Cards list */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[420px]" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className={`w-10 h-10 rounded-xl ${cfg.iconBg} flex items-center justify-center mb-2`}>
              <IconEl className={`w-5 h-5 ${cfg.icon}`} />
            </div>
            <p className="text-xs text-gray-600">No {cfg.label.toLowerCase()} items</p>
          </div>
        ) : (
          cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-3.5 rounded-xl flex items-start gap-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${cfg.border}` }}
            >
              <div className="mt-0.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: cfg.dot }} />
              </div>
              <p className="text-gray-200 text-xs leading-relaxed">{card.text}</p>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function PolicyInsightsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorStr, setErrorStr] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const processFile = async (selectedFile: File) => {
    setIsUploading(true);
    setErrorStr(null);
    setAnalysis(null);

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
          setAnalysis(res.data as AnalysisResult);
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

  const coverageCards: InsightCard[] = (analysis?.coverage ?? []).map((t, i) => ({ id: `c${i}`, type: 'coverage', text: t }));
  const exclusionCards: InsightCard[] = (analysis?.exclusions ?? []).map((t, i) => ({ id: `e${i}`, type: 'exclusion', text: t }));
  const riskCards: InsightCard[] = (analysis?.personalizedRisks ?? []).map((t, i) => ({ id: `r${i}`, type: 'risk', text: t }));

  const scoreColor = !analysis ? '' : analysis.score >= 75 ? 'from-emerald-500 to-teal-400' : analysis.score >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400';
  const scoreLabel = !analysis ? '' : analysis.score >= 75 ? 'Great coverage' : analysis.score >= 50 ? 'Average coverage' : 'Needs improvement';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {analysis && (
        <ScoreBreakdownModal
          open={showScoreModal}
          onClose={() => setShowScoreModal(false)}
          score={analysis.score}
          breakdown={analysis.scoreBreakdown}
          reason={analysis.scoreReason}
          improvements={analysis.improvements}
          policyName={analysis.policyName}
        />
      )}

      <div className="min-h-screen pt-6 pb-10 px-4 lg:px-6 relative">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-blue-700/6 blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-purple-700/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">

          {/* Page Title */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Policy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Insights</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Upload a policy PDF — Gemini AI breaks down every clause for you.</p>
          </motion.div>

          {/* ── Upload Zone ── */}
          {!analysis ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div
                className={`rounded-[2rem] transition-all duration-300 relative overflow-hidden min-h-[420px] flex flex-col items-center justify-center p-8 cursor-pointer group ${isDragging ? 'scale-[1.01]' : ''}`}
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
                  e.preventDefault(); setIsDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f && f.type === 'application/pdf') { setFile(f); setErrorStr(null); }
                }}
              >
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-5 text-center">
                      <div className="w-24 h-24 rounded-3xl flex items-center justify-center transition-all group-hover:scale-105" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 0 40px rgba(59,130,246,0.1)' }}>
                        <Upload className="w-10 h-10 text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Drop your policy PDF</h2>
                        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">We use Gemini 2.5 Flash to dissect every clause and surface what matters to <em className="text-gray-400 not-italic font-semibold">you</em>.</p>
                      </div>
                      <div className="mt-2 px-8 py-3 rounded-full text-sm font-bold text-white group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}>
                        Browse Files
                      </div>
                      <p className="text-xs text-gray-700">or drag &amp; drop here</p>
                    </motion.div>
                  ) : (
                    <motion.div key="selected" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center gap-5 text-center w-full max-w-xs">
                      <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                        <FileText className="w-9 h-9 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-white truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · PDF</p>
                      </div>
                      {errorStr && (
                        <div className="w-full p-4 rounded-2xl text-left text-xs text-red-400 bg-red-500/8 border border-red-500/20 whitespace-pre-wrap break-all">{errorStr}</div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); processFile(file); }}
                        disabled={isUploading}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
                      >
                        {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analysing with Gemini…</> : <><ShieldCheck className="w-5 h-5" /> Reveal My Coverage</>}
                      </button>
                      {!isUploading && (
                        <button onClick={(e) => { e.stopPropagation(); setFile(null); setErrorStr(null); }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline">
                          Remove file
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) { setFile(e.target.files[0]); setErrorStr(null); } }} />
              </div>
            </motion.div>
          ) : (
            /* ── Analysis Results ── */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Top bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-lg font-bold text-white">{analysis.policyName}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{coverageCards.length} covered · {exclusionCards.length} excluded · {riskCards.length} risks identified</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Score pill — clickable */}
                  <button
                    onClick={() => setShowScoreModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-amber-500/25 hover:border-amber-500/50 bg-amber-500/8 hover:bg-amber-500/12 transition-all group"
                  >
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${scoreColor}`}>{analysis.score}</span>
                    <span className="text-xs text-gray-500">{scoreLabel}</span>
                    <Info className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </button>
                  <button
                    onClick={() => { setAnalysis(null); setFile(null); setErrorStr(null); }}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-2.5 rounded-xl hover:bg-white/5 border border-white/5"
                  >
                    <X className="w-3.5 h-3.5" /> New Analysis
                  </button>
                </div>
              </div>

              {/* Key Facts strip */}
              {analysis.keyFacts && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {Object.entries(analysis.keyFacts).map(([k, v]) => (
                    v && v !== 'Not Specified' ? (
                      <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-gray-200 font-semibold">{v}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              )}

              {/* ── 3-Column Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CategoryColumn type="coverage" cards={coverageCards} />
                <CategoryColumn type="exclusion" cards={exclusionCards} />
                <CategoryColumn type="risk" cards={riskCards} />
              </div>

              {/* Score tap hint */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600"
              >
                <Star className="w-3 h-3 text-amber-500" />
                <span>Tap the <span className="text-amber-400 font-semibold">SpashtAI Score</span> to see why and how to improve it</span>
              </motion.div>

              {/* Quick nav */}
              <div className="mt-5 flex flex-wrap gap-3 justify-center">
                {[
                  { href: '/simulator', label: 'Run Scenario Simulator', emoji: '⚡' },
                  { href: '/compare', label: 'Compare Two Policies', emoji: '⚖️' },
                  { href: '/dashboard', label: 'View My Profile', emoji: '👤' },
                ].map(({ href, label, emoji }) => (
                  <button
                    key={href}
                    onClick={() => router.push(href)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/8 hover:bg-white/6 text-sm text-gray-400 hover:text-white transition-all group"
                  >
                    <span>{emoji}</span>
                    <span>{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
