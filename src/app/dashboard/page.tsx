'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Activity, Shield, MapPin, Heart, DollarSign,
  Car, Smartphone, Loader2, ChevronRight, Plus, Star,
  FileText, TrendingUp, AlertTriangle, CheckCircle2,
  BarChart3, Clock, Zap, ArrowRight, RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { getUserPolicyAnalyses } from '@/app/actions';

const glassCard = {
  background: 'linear-gradient(135deg, rgba(14,14,22,0.90) 0%, rgba(18,12,36,0.94) 100%)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(99,130,255,0.12)',
  boxShadow: '0 0 60px rgba(59,130,246,0.05)',
};

type PolicyAnalysis = {
  id: string;
  policyName: string;
  score: number;
  scoreBreakdown: Record<string, number>;
  scoreReason: string;
  improvements: string[];
  coverage: string[];
  exclusions: string[];
  personalizedRisks: string[];
  keyFacts: Record<string, string>;
  uploadedAt: string;
};

function ScoreBadge({ score }: { score: number }) {
  const gradient = score >= 75 ? 'from-emerald-500 to-teal-400' : score >= 50 ? 'from-amber-400 to-yellow-300' : 'from-red-500 to-rose-400';
  const bg = score >= 75 ? 'bg-emerald-500/12 border-emerald-500/25' : score >= 50 ? 'bg-amber-500/12 border-amber-500/25' : 'bg-red-500/12 border-red-500/25';
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${bg}`}>
      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
      <span className={`text-sm font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>{score}</span>
    </div>
  );
}

function PolicyHistoryCard({ analysis, index }: { analysis: PolicyAnalysis; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const uploadedDate = new Date(analysis.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-[1.5rem] overflow-hidden"
      style={glassCard}
    >
      {/* Header row */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb20,#7c3aed20)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{analysis.policyName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock className="w-3 h-3 text-gray-600" />
            <p className="text-xs text-gray-500">{uploadedDate}</p>
          </div>
        </div>
        <ScoreBadge score={analysis.score} />
        <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-white/6 space-y-4">

              {/* Score reason */}
              <p className="text-xs text-gray-400 leading-relaxed">{analysis.scoreReason}</p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Covered', count: analysis.coverage.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { label: 'Excluded', count: analysis.exclusions.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
                  { label: 'Risks', count: analysis.personalizedRisks.length, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                ].map(({ label, count, icon: Icon, color, bg }) => (
                  <div key={label} className={`flex flex-col items-center p-3 rounded-xl border ${bg} text-center`}>
                    <Icon className={`w-4 h-4 ${color} mb-1`} />
                    <span className="text-lg font-bold text-white">{count}</span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>

              {/* Key facts */}
              {analysis.keyFacts && Object.keys(analysis.keyFacts).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(analysis.keyFacts).map(([k, v]) =>
                    v && v !== 'Not Specified' ? (
                      <span key={k} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}: </span>
                        <span className="text-gray-300">{v}</span>
                      </span>
                    ) : null
                  )}
                </div>
              )}

              {/* Top improvement */}
              {analysis.improvements?.[0] && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/7 border border-blue-500/15">
                  <ArrowRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-300 leading-relaxed">{analysis.improvements[0]}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [analyses, setAnalyses] = useState<PolicyAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);
  const [analysesFetched, setAnalysesFetched] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid && !analysesFetched) {
      setLoadingAnalyses(true);
      getUserPolicyAnalyses(user.uid).then(res => {
        if (res.success && res.data) setAnalyses(res.data as PolicyAnalysis[]);
        setLoadingAnalyses(false);
        setAnalysesFetched(true);
      });
    }
  }, [user, analysesFetched]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const avgScore = analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length) : null;
  const avgScoreGradient = avgScore === null ? '' : avgScore >= 75 ? 'from-emerald-500 to-teal-400' : avgScore >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pt-6 pb-10 px-4 lg:px-6 relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full bg-blue-700/6 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-purple-700/5 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Dashboard</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your profile, insurance history and personalised stats.</p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-5 items-start">

          {/* LEFT — Policy history */}
          <div className="space-y-4">

            {/* Upload prompt card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <button
                onClick={() => router.push('/policy-insights')}
                className="w-full rounded-[1.5rem] p-5 flex items-center gap-4 border border-dashed border-blue-500/25 hover:border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/8 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">Analyse a New Policy</p>
                  <p className="text-xs text-gray-500 mt-0.5">Upload a PDF and get an instant Gemini-powered breakdown</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors shrink-0" />
              </button>
            </motion.div>

            {/* Stats row when analyses exist */}
            {analyses.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Policies Analysed', value: analyses.length, icon: FileText, gradient: 'from-blue-500 to-indigo-500' },
                  { label: 'Avg SpashtAI Score', value: avgScore ?? '—', icon: Star, gradient: avgScoreGradient || 'from-amber-500 to-yellow-400' },
                  { label: 'Total Risks Found', value: analyses.reduce((s, a) => s + a.personalizedRisks.length, 0), icon: AlertTriangle, gradient: 'from-rose-500 to-red-400' },
                ].map(({ label, value, icon: Icon, gradient }) => (
                  <div key={label} className="rounded-[1.5rem] p-4 text-center" style={glassCard}>
                    <div className={`w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br ${gradient} opacity-90`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>{value}</div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wider mt-0.5">{label}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Policy Analysis History */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Policy History</h2>
                <button
                  onClick={() => { setAnalysesFetched(false); }}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {loadingAnalyses ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : analyses.length === 0 ? (
                <div className="rounded-[1.5rem] p-8 text-center" style={glassCard}>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7 text-blue-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">No policies analysed yet</p>
                  <p className="text-gray-600 text-xs mt-1 mb-4">Upload your first policy PDF to get started</p>
                  <button
                    onClick={() => router.push('/policy-insights')}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
                  >
                    Get My First Analysis →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((a, i) => <PolicyHistoryCard key={a.id} analysis={a} index={i} />)}
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT — Profile card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4">

            {/* Profile */}
            <div className="rounded-[2rem] overflow-hidden" style={glassCard}>
              {/* Banner */}
              <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)' }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />
              </div>
              <div className="px-6 pb-6">
                <div className="-mt-8 mb-4 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white relative z-10"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', border: '3px solid rgba(14,14,22,1)', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
                  {initials}
                </div>
                <h2 className="font-bold text-white text-lg leading-tight">{displayName}</h2>
                <p className="text-gray-500 text-xs truncate mb-5">{user?.email}</p>

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
                  <button onClick={() => router.push('/onboarding')} className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all">
                    Complete your profile →
                  </button>
                )}
              </div>
            </div>

            {/* Profile details (when profile exists) */}
            {profile && (
              <div className="rounded-[2rem] p-5 space-y-4" style={glassCard}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Your Details</p>

                {[
                  { icon: MapPin, label: profile.basicInfo?.city || '—', sub: 'City' },
                  { icon: User, label: profile.basicInfo?.gender || '—', sub: 'Gender' },
                  { icon: Heart, label: profile.health?.diseases || 'None', sub: 'Pre-existing Conditions' },
                  { icon: Activity, label: profile.health?.exerciseLevel || '—', sub: 'Exercise Level' },
                  { icon: DollarSign, label: profile.financial?.salary ? `₹${Number(profile.financial.salary).toLocaleString('en-IN')}` : '—', sub: 'Annual Salary' },
                  { icon: Shield, label: profile.financial?.riskAppetite || '—', sub: 'Risk Appetite' },
                  { icon: Car, label: profile.assets?.car || '—', sub: 'Car Owner' },
                  { icon: Smartphone, label: profile.assets?.device || '—', sub: 'Device' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={sub} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{label}</p>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider">{sub}</p>
                    </div>
                  </div>
                ))}

                <button onClick={() => router.push('/onboarding')} className="w-full mt-2 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/4 border border-white/8 hover:bg-white/8 transition-all">
                  Edit Profile
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-[2rem] p-5" style={glassCard}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Quick Actions</p>
              <div className="flex flex-col gap-2">
                {[
                  { href: '/policy-insights', label: 'Analyse a Policy', emoji: '🔍' },
                  { href: '/simulator', label: 'Run Scenario Simulator', emoji: '⚡' },
                  { href: '/compare', label: 'Compare Two Policies', emoji: '⚖️' },
                ].map(({ href, label, emoji }) => (
                  <button key={href} onClick={() => router.push(href)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 text-left transition-all group">
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
