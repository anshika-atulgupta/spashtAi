'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, User, Heart, Wallet, Car, Smartphone, Cigarette, Wine, Dumbbell, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/layout/AuthProvider';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useEffect } from 'react';

// ─── Reusable Components ────────────────────────────────────────────────
function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
        <span className="text-blue-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all text-lg"
    />
  );
}

function PillGroup({ options, value, onChange }: { options: { label: string; value: string; emoji?: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-5 py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
            value === opt.value
              ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]'
              : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/8'
          }`}
        >
          {opt.emoji && <span className="mr-2">{opt.emoji}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, profile, loading, refreshProfile } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile) {
        // If user already has a profile, they don't need to onboard again
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  const [formData, setFormData] = useState({
    basicInfo: { age: '', gender: '', city: '' },
    health: { diseases: '', smoking: 'No', drinking: 'No', exerciseLevel: 'Moderate' },
    financial: { salary: '', budget: '', riskAppetite: 'Medium', dependents: '0' },
    assets: { car: 'No', device: 'Smartphone' },
  });

  const update = (section: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const [dir, setDir] = useState(1);
  const totalSteps = 3;

  const next = () => { setDir(1); setStep(s => Math.min(s + 1, totalSteps)); };
  const back = () => { setDir(-1); setStep(s => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'users', user.uid), formData);
      await refreshProfile(user.uid);
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to save profile', err);
      setIsSubmitting(false);
    }
  };

  if (loading || !user || profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
  };

  const stepMeta = [
    { title: 'The Basics', subtitle: 'Tell us a bit about yourself', icon: <User className="w-5 h-5" /> },
    { title: 'Your Health', subtitle: 'Helps personalise your risk profile', icon: <Heart className="w-5 h-5" /> },
    { title: 'Finance & Assets', subtitle: 'What you own and earn', icon: <Wallet className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      {/* Space glow halo that sits right behind the card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[560px] h-[560px] rounded-full bg-blue-700/10 blur-[120px]" />
      </div>

      {/* Floating wrapper — levitates the whole onboarding card */}
      <motion.div
        className="w-full max-w-xl z-10"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >

        {/* ── Step Progress ── */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${done ? 'bg-blue-600 border-blue-500 text-white' : active ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : n}
                </div>
                {i < totalSteps - 1 && (
                  <div className="w-16 h-0.5 rounded-full overflow-hidden bg-white/10">
                    <motion.div className="h-full bg-blue-500" animate={{ width: step > n ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Card ── */}
        {/* Bottom glow — mimics surface reflection when floating */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-500/20 blur-2xl rounded-full pointer-events-none" />
        <div
          className="relative rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.12),0_0_40px_rgba(99,102,241,0.08)]"
          style={{
            background: 'linear-gradient(135deg, rgba(14,14,22,0.88) 0%, rgba(18,12,36,0.92) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(99,130,255,0.15)',
          }}
        >

          {/* Card Header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                {stepMeta[step - 1].icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{stepMeta[step - 1].title}</h2>
                <p className="text-sm text-gray-500">{stepMeta[step - 1].subtitle}</p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-8 py-8 min-h-[380px]">
            <AnimatePresence mode="wait" custom={dir}>
              {step === 1 && (
                <motion.div key="s1" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-6">
                  <Field label="How old are you?" icon={<Calendar className="w-4 h-4" />}>
                    <TextInput value={formData.basicInfo.age} onChange={v => update('basicInfo', 'age', v)} placeholder="e.g. 28" type="number" />
                  </Field>

                  <Field label="Gender" icon={<User className="w-4 h-4" />}>
                    <PillGroup
                      value={formData.basicInfo.gender}
                      onChange={v => update('basicInfo', 'gender', v)}
                      options={[
                        { label: 'Male', value: 'Male', emoji: '👨' },
                        { label: 'Female', value: 'Female', emoji: '👩' },
                        { label: 'Other', value: 'Other', emoji: '🧑' },
                      ]}
                    />
                  </Field>

                  <Field label="City you live in" icon={<MapPin className="w-4 h-4" />}>
                    <TextInput value={formData.basicInfo.city} onChange={v => update('basicInfo', 'city', v)} placeholder="e.g. Mumbai, Delhi, Bangalore" />
                  </Field>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="s2" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-6">
                  <Field label="Pre-existing conditions?" icon={<Heart className="w-4 h-4" />}>
                    <TextInput value={formData.health.diseases} onChange={v => update('health', 'diseases', v)} placeholder="e.g. Diabetes, Hypertension (or leave blank)" />
                  </Field>

                  <Field label="Do you smoke?" icon={<Cigarette className="w-4 h-4" />}>
                    <PillGroup
                      value={formData.health.smoking}
                      onChange={v => update('health', 'smoking', v)}
                      options={[
                        { label: 'No', value: 'No', emoji: '🚭' },
                        { label: 'Occasionally', value: 'Occasional', emoji: '🚬' },
                        { label: 'Regularly', value: 'Regular', emoji: '🚬🚬' },
                      ]}
                    />
                  </Field>

                  <Field label="Do you drink alcohol?" icon={<Wine className="w-4 h-4" />}>
                    <PillGroup
                      value={formData.health.drinking}
                      onChange={v => update('health', 'drinking', v)}
                      options={[
                        { label: 'No', value: 'No', emoji: '🚫' },
                        { label: 'Occasionally', value: 'Occasional', emoji: '🍷' },
                        { label: 'Regularly', value: 'Regular', emoji: '🍺' },
                      ]}
                    />
                  </Field>

                  <Field label="How active are you?" icon={<Dumbbell className="w-4 h-4" />}>
                    <PillGroup
                      value={formData.health.exerciseLevel}
                      onChange={v => update('health', 'exerciseLevel', v)}
                      options={[
                        { label: 'Low', value: 'Low', emoji: '🛋️' },
                        { label: 'Moderate', value: 'Moderate', emoji: '🚶' },
                        { label: 'Very Active', value: 'High', emoji: '🏋️' },
                      ]}
                    />
                  </Field>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="s3" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Annual Salary (₹)" icon={<Wallet className="w-4 h-4" />}>
                      <TextInput value={formData.financial.salary} onChange={v => update('financial', 'salary', v)} placeholder="e.g. 12,00,000" type="number" />
                    </Field>
                    <Field label="Insurance Budget/yr" icon={<Wallet className="w-4 h-4" />}>
                      <TextInput value={formData.financial.budget} onChange={v => update('financial', 'budget', v)} placeholder="e.g. 20,000" type="number" />
                    </Field>
                  </div>

                  <Field label="Dependents (family members)" icon={<Users className="w-4 h-4" />}>
                    <PillGroup
                      value={formData.financial.dependents}
                      onChange={v => update('financial', 'dependents', v)}
                      options={[
                        { label: 'Just me', value: '0' },
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: '3', value: '3' },
                        { label: '4+', value: '4' },
                      ]}
                    />
                  </Field>

                  <Field label="Risk appetite" icon={<Wallet className="w-4 h-4" />}>
                    <PillGroup
                      value={formData.financial.riskAppetite}
                      onChange={v => update('financial', 'riskAppetite', v)}
                      options={[
                        { label: 'Conservative', value: 'Low', emoji: '🛡️' },
                        { label: 'Moderate', value: 'Medium', emoji: '⚖️' },
                        { label: 'Aggressive', value: 'High', emoji: '🚀' },
                      ]}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Own a car?" icon={<Car className="w-4 h-4" />}>
                      <PillGroup
                        value={formData.assets.car}
                        onChange={v => update('assets', 'car', v)}
                        options={[{ label: 'Yes 🚗', value: 'Yes' }, { label: 'No', value: 'No' }]}
                      />
                    </Field>
                    <Field label="Primary device" icon={<Smartphone className="w-4 h-4" />}>
                      <PillGroup
                        value={formData.assets.device}
                        onChange={v => update('assets', 'device', v)}
                        options={[{ label: '📱 Phone', value: 'Smartphone' }, { label: '💻 Laptop', value: 'Laptop' }]}
                      />
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card Footer */}
          <div className="px-8 pb-8 flex justify-between items-center">
            <button
              onClick={back}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'}`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold shadow-[0_0_24px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Go to Dashboard</>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6 tracking-wide">
          🔒 Your data is stored locally and never shared without your consent.
        </p>
      </motion.div>
    </div>
  );
}
