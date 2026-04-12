'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, CheckCircle2, Loader2, Trophy,
  AlertTriangle, Info, Download, GitCompare, X, Hospital,
  Car, Pill, Smile, ShieldOff
} from 'lucide-react';
import { comparePolicies } from '@/app/actions';
import { useAuth } from '@/components/layout/AuthProvider';
import { useRouter } from 'next/navigation';

// ── Types ────────────────────────────────────────────────────────────────────
type Rating = 'good' | 'partial' | 'weak';
interface CategoryResult {
  rating: Rating;
  detail: string;
}
interface PolicyResult {
  name: string;
  score: number;
  categories: {
    hospitalization: CategoryResult;
    accidents: CategoryResult;
    medicines: CategoryResult;
    dental: CategoryResult;
    exclusions: CategoryResult;
  };
}
interface CompareData {
  policyA: PolicyResult;
  policyB: PolicyResult;
  winner: 'A' | 'B' | 'tie';
  recommendation: string;
  insights: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const RATING_CONFIG: Record<Rating, { color: string; bg: string; border: string; label: string }> = {
  good:    { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', label: 'Strong' },
  partial: { color: 'text-amber-400',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30',   label: 'Partial' },
  weak:    { color: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/30',     label: 'Weak' },
};

const CATEGORY_META: { key: keyof PolicyResult['categories']; label: string; icon: React.ReactNode }[] = [
  { key: 'hospitalization', label: 'Hospitalization', icon: <Hospital className="w-4 h-4" /> },
  { key: 'accidents',       label: 'Accidents',       icon: <Car className="w-4 h-4" /> },
  { key: 'medicines',       label: 'Medicines',       icon: <Pill className="w-4 h-4" /> },
  { key: 'dental',          label: 'Dental',          icon: <Smile className="w-4 h-4" /> },
  { key: 'exclusions',      label: 'Exclusions',      icon: <ShieldOff className="w-4 h-4" /> },
];

const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res((reader.result as string).split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

// ── Animated Score Bar ────────────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  );
}

// ── Drop Zone ─────────────────────────────────────────────────────────────────
function DropZone({
  label,
  file,
  onFile,
  color,
  disabled,
}: {
  label: string;
  file: File | null;
  onFile: (f: File) => void;
  color: 'blue' | 'purple';
  disabled: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accent = color === 'blue'
    ? { border: 'border-blue-500/40', glow: 'shadow-blue-500/20', bg: 'bg-blue-600/10', text: 'text-blue-400', pill: 'bg-blue-600/20 border-blue-500/40 text-blue-300' }
    : { border: 'border-purple-500/40', glow: 'shadow-purple-500/20', bg: 'bg-purple-600/10', text: 'text-purple-400', pill: 'bg-purple-600/20 border-purple-500/40 text-purple-300' };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 min-h-[220px]
        ${dragging ? `${accent.border} ${accent.bg} shadow-lg ${accent.glow}` : 'border-white/8 hover:border-white/20'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(14,14,22,0.85), rgba(18,12,36,0.9))',
        backdropFilter: 'blur(30px)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className={`w-14 h-14 rounded-2xl ${accent.bg} border ${accent.border} flex items-center justify-center`}>
              <FileText className={`w-7 h-7 ${accent.text}`} />
            </div>
            <div>
              <p className="font-bold text-white text-sm truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB · PDF</p>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${accent.pill}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <UploadCloud className="w-7 h-7 text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-white">{label}</p>
              <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload PDF</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Category Row ───────────────────────────────────────────────────────────────
function CategoryRow({ catKey, label, icon, a, b }: {
  catKey: string;
  label: string;
  icon: React.ReactNode;
  a: CategoryResult;
  b: CategoryResult;
}) {
  const ra = RATING_CONFIG[a.rating];
  const rb = RATING_CONFIG[b.rating];
  const ratingOrder = { good: 2, partial: 1, weak: 0 };
  const aWins = ratingOrder[a.rating] > ratingOrder[b.rating];
  const bWins = ratingOrder[b.rating] > ratingOrder[a.rating];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start"
    >
      {/* Policy A */}
      <div className={`p-4 rounded-2xl border ${ra.bg} ${ra.border} ${aWins ? 'ring-1 ring-emerald-500/30' : ''}`}>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${ra.bg} ${ra.color} border ${ra.border} mb-2`}>
          {ra.label}
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{a.detail}</p>
      </div>

      {/* Category label - center */}
      <div className="flex flex-col items-center gap-1.5 pt-3 min-w-[90px]">
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
          {icon}
        </div>
        <span className="text-xs font-semibold text-gray-500 text-center">{label}</span>
      </div>

      {/* Policy B */}
      <div className={`p-4 rounded-2xl border ${rb.bg} ${rb.border} ${bWins ? 'ring-1 ring-emerald-500/30' : ''}`}>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${rb.bg} ${rb.color} border ${rb.border} mb-2`}>
          {rb.label}
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{b.detail}</p>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ComparePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CompareData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleCompare = async () => {
    if (!fileA || !fileB) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const [b64A, b64B] = await Promise.all([toBase64(fileA), toBase64(fileB)]);
      const currentProfile = profile || { basicInfo: { age: 30 } };

      const res = await comparePolicies(
        { inlineData: { data: b64A, mimeType: 'application/pdf' } },
        { inlineData: { data: b64B, mimeType: 'application/pdf' } },
        currentProfile
      );

      if (res.success && res.data) {
        setResult(res.data as CompareData);
      } else {
        setError(res.error || 'Failed to compare policies.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const winnerLabel = result
    ? result.winner === 'A' ? result.policyA.name : result.winner === 'B' ? result.policyB.name : 'Both policies are equal'
    : '';

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-card { background: white !important; border: 1px solid #e5e7eb !important; color: black !important; }
          .print-title { color: black !important; }
        }
      `}</style>

      <div className="min-h-screen px-4 py-24 relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="w-[900px] h-[600px] rounded-full bg-indigo-700/5 blur-[180px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col gap-10">

          {/* ── Header ── */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-sm font-semibold tracking-wide uppercase no-print">
              <GitCompare className="w-4 h-4" /> Policy Comparison
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight print-title">
              Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">best policy</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Upload two PDFs and let our AI engine dissect every clause, coverage, and exclusion for you.
            </p>
          </div>

          {/* ── Upload Section ── */}
          <div className="no-print grid md:grid-cols-2 gap-6">
            <DropZone label="Upload Policy A" file={fileA} onFile={setFileA} color="blue" disabled={isAnalyzing} />
            <DropZone label="Upload Policy B" file={fileB} onFile={setFileB} color="purple" disabled={isAnalyzing} />
          </div>

          {/* ── Analyze Button ── */}
          {!result && (
            <div className="no-print flex flex-col items-center gap-4">
              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-2xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}
              <button
                onClick={handleCompare}
                disabled={!fileA || !fileB || isAnalyzing}
                className="px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all disabled:opacity-40 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 32px rgba(99,102,241,0.35)' }}
              >
                {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing policies…</>
                ) : (
                  <><GitCompare className="w-5 h-5" /> Compare Policies</>
                )}
              </button>
              {isAnalyzing && (
                <p className="text-gray-500 text-sm animate-pulse">
                  Reading both documents with Gemini AI… this may take up to 30 seconds.
                </p>
              )}
            </div>
          )}

          {/* ── Results ── */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-8"
              >

                {/* Score Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Policy A Score */}
                  {([['A', result.policyA, 'from-blue-600 to-blue-400'], ['B', result.policyB, 'from-purple-600 to-purple-400']] as const).map(([key, policy, gradient]) => (
                    <div
                      key={key}
                      className="print-card rounded-[2rem] p-7 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(14,14,22,0.9), rgba(18,12,36,0.95))',
                        border: '1px solid rgba(100,130,255,0.15)',
                        backdropFilter: 'blur(30px)',
                      }}
                    >
                      {result.winner === key && (
                        <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                          <Trophy className="w-3.5 h-3.5" /> Winner
                        </div>
                      )}
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Policy {key}</p>
                      <h3 className="text-xl font-bold text-white mb-5 pr-20 leading-tight">{policy.name}</h3>
                      <div className="flex items-end gap-3 mb-3">
                        <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>
                          {policy.score}
                        </span>
                        <span className="text-gray-500 text-sm mb-2">/100</span>
                      </div>
                      <ScoreBar
                        score={policy.score}
                        color={key === 'A' ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-gradient-to-r from-purple-600 to-purple-400'}
                      />
                    </div>
                  ))}
                </div>

                {/* Category Comparison */}
                <div
                  className="print-card rounded-[2rem] p-7"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,14,22,0.9), rgba(18,12,36,0.95))',
                    border: '1px solid rgba(100,130,255,0.15)',
                    backdropFilter: 'blur(30px)',
                  }}
                >
                  {/* Column Headers */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-6">
                    <div className="text-sm font-bold text-blue-400 uppercase tracking-widest">{result.policyA.name}</div>
                    <div className="min-w-[90px] text-center text-xs font-bold text-gray-600 uppercase tracking-widest pt-1">Category</div>
                    <div className="text-sm font-bold text-purple-400 uppercase tracking-widest text-right">{result.policyB.name}</div>
                  </div>

                  <div className="flex flex-col gap-5">
                    {CATEGORY_META.map(({ key, label, icon }) => (
                      <CategoryRow
                        key={key}
                        catKey={key}
                        label={label}
                        icon={icon}
                        a={result.policyA.categories[key]}
                        b={result.policyB.categories[key]}
                      />
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div
                  className="print-card rounded-[2rem] p-7 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,14,22,0.9), rgba(18,12,36,0.95))',
                    border: '1px solid rgba(100,130,255,0.15)',
                    backdropFilter: 'blur(30px)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-blue-600/5 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Our Recommendation</p>
                        <h3 className="text-lg font-bold text-white">
                          {result.winner === 'tie' ? 'Both policies are comparable' : `Go with ${winnerLabel}`}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>

                {/* Insights */}
                <div
                  className="print-card rounded-[2rem] p-7"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,14,22,0.9), rgba(18,12,36,0.95))',
                    border: '1px solid rgba(100,130,255,0.15)',
                    backdropFilter: 'blur(30px)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Info className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-lg">Key Insights</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    {result.insights.map((insight, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20"
                      >
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="no-print flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
                  >
                    <Download className="w-5 h-5" /> Download Report
                  </button>
                  <button
                    onClick={() => { setResult(null); setFileA(null); setFileB(null); setError(null); }}
                    className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-gray-300 border border-white/10 hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" /> Start Over
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
