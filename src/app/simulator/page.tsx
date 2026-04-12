'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Activity, ShieldAlert, Sparkles, Building2, PhoneCall, FileText, CheckCircle } from 'lucide-react';
import { simulateScenario } from '@/app/actions';
import { useAuth } from '@/components/layout/AuthProvider';
import { useRouter } from 'next/navigation';

// Custom CountUp Component
function CountUp({ to, duration = 1.5 }: { to: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      // Use easeOutQuart for smooth slow-down
      const raw = Math.min(progress / (duration * 1000), 1);
      const percentage = 1 - Math.pow(1 - raw, 4);
      
      setCount(Math.floor(to * percentage));

      if (raw < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [to, duration]);

  return <>{count.toLocaleString('en-IN')}</>;
}

const PREDEFINED_SCENARIOS = [
  { label: 'I get dengue', emoji: '🦟' },
  { label: 'Car accident', emoji: '🚗' },
  { label: 'Phone stolen', emoji: '📱' },
];

export default function SimulatorPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [inputObj, setInputObj] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSimulate = async (scenarioText: string) => {
    if (!scenarioText.trim()) return;
    setInputObj(scenarioText);
    setIsLoading(true);
    setError(null);
    setResult(null);

    const currentProfile = profile || { basicInfo: { age: 30 } };

    const res = await simulateScenario(scenarioText, currentProfile);
    if (res.success && res.data) {
      setResult(res.data);
    } else {
      setError(res.error || 'Failed to simulate scenario.');
    }
    
    setIsLoading(false);
  };

  const getStepIcon = (idx: number) => {
    const icons = [Building2, PhoneCall, FileText, CheckCircle];
    const Icon = icons[idx % icons.length];
    return <Icon className="w-5 h-5 text-blue-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-24 relative select-none">
      {/* Background ambient glow */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[800px] h-[600px] rounded-full bg-blue-700/5 blur-[160px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center space-y-4 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-sm font-semibold tracking-wide uppercase">
            <Activity className="w-4 h-4" /> Scenario Simulator
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            See the exact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">financial impact</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Select a common life event or type your own to simulate how your insurance will respond in real life.
          </p>
        </div>

        {/* Input Section */}
        <div 
          className="rounded-[2rem] p-6 lg:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(14,14,22,0.88), rgba(18,12,36,0.92))',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(100,130,255,0.15)',
            boxShadow: '0 0 80px rgba(59,130,246,0.06)'
          }}
        >
          <div className="flex flex-wrap gap-3 mb-6">
            {PREDEFINED_SCENARIOS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSimulate(s.label)}
                disabled={isLoading}
                className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/40 hover:bg-white/10 text-gray-300 font-medium transition-all"
              >
                <span className="mr-2">{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSimulate(inputObj); }} 
            className="flex flex-col sm:flex-row gap-4"
          >
            <input
              type="text"
              value={inputObj}
              onChange={(e) => setInputObj(e.target.value)}
              placeholder="Or type a custom scenario (e.g. 'Stray dog bite')"
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-lg"
            />
            <button
              type="submit"
              disabled={isLoading || !inputObj.trim()}
              className="px-8 py-4 rounded-2xl font-bold text-white transition-all disabled:opacity-50 sm:w-auto w-full flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Simulate</>}
            </button>
          </form>
          
          {error && <p className="text-red-400 mt-4 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}
        </div>

        {/* Results Section */}
        <AnimatePresence mode="popLayout">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="grid lg:grid-cols-2 gap-6"
            >
              {/* Financial Breakdown */}
              <div 
                className="rounded-[2rem] p-8 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(14,14,22,0.88), rgba(18,12,36,0.92))',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(100,130,255,0.15)'
                }}
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-8">Financial Breakdown</h2>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Insurance Pays</p>
                      <p className="text-3xl lg:text-4xl font-black text-green-400">
                        ₹<CountUp to={result.insurancePays || 0} />
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">You Pay</p>
                      <p className="text-3xl lg:text-4xl font-black text-red-400">
                        ₹<CountUp to={result.userPays || 0} />
                      </p>
                    </div>
                  </div>

                  {/* Stacked Bar */}
                  <div className="w-full h-8 flex rounded-full overflow-hidden bg-white/5 border border-white/5">
                    {result.totalCost > 0 && (
                      <>
                        <motion.div 
                          className="h-full bg-green-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(result.insurancePays / result.totalCost) * 100}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                        <motion.div 
                          className="h-full bg-red-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${(result.userPays / result.totalCost) * 100}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut' }}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-widest mt-4">
                    <span>Total Cost</span>
                    <span>₹<CountUp to={result.totalCost || 0} /></span>
                  </div>
                </div>
              </div>

              {/* Action Plan & Timeline */}
              <div 
                className="rounded-[2rem] p-8 flex flex-col relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(14,14,22,0.88), rgba(18,12,36,0.92))',
                  backdropFilter: 'blur(40px)',
                  border: '1px solid rgba(100,130,255,0.15)'
                }}
              >
                <h2 className="text-xl font-bold text-white mb-6 relative z-10">Action Plan</h2>
                <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-[340px] pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59,130,246,0.5) transparent' }}>
                  <div className="space-y-6 relative z-10 
                    before:absolute before:inset-0 before:ml-5 md:before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-blue-500/20 before:to-transparent">
                    {(result.steps || []).map((step: any, idx: number) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 + (idx * 0.1) }}
                        className="relative flex items-center justify-normal"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-transparent bg-blue-600/20 text-slate-500 shrink-0 relative z-10">
                          {getStepIcon(idx)}
                        </div>
                        
                        <div className="ml-4 w-full p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors flex flex-col">
                          <span className="font-bold text-white mb-1">{step.title}</span>
                          <span className="text-sm text-gray-400">{step.description}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Highlighted Time Estimate */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="mt-8 relative overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 z-0" />
                  <div className="relative z-10 p-4 border border-blue-500/30 flex items-center gap-4 bg-transparent">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold text-blue-300 mb-0.5">Estimated Timeline</p>
                      <p className="font-bold text-white text-lg">{result.timeEstimate}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
