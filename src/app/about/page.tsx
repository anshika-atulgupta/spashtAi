'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Eye, Star, Quote, ArrowRight, Users, FileText, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

const glassCard = {
  background: 'linear-gradient(135deg, rgba(14,14,22,0.90) 0%, rgba(18,12,36,0.94) 100%)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(99,130,255,0.12)',
  boxShadow: '0 0 60px rgba(59,130,246,0.05)',
};

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bengaluru',
    avatar: 'PS',
    avatarGrad: 'from-pink-500 to-rose-500',
    score: 78,
    quote: 'I uploaded my Star Health policy and SpashtAI found 3 exclusions I had completely missed — including my diabetes medication. Saved me from a nasty surprise during a claim.',
    policy: 'Star Health Individual',
  },
  {
    name: 'Rahul Mehta',
    role: 'Freelance Designer, Mumbai',
    avatar: 'RM',
    avatarGrad: 'from-blue-500 to-indigo-500',
    score: 61,
    quote: 'The Scenario Simulator showed me exactly how much I\'d pay out-of-pocket for a knee surgery. I switched policies the next week. Absolute game changer.',
    policy: 'HDFC Ergo Optima',
  },
  {
    name: 'Ananya Reddy',
    role: 'Teacher, Hyderabad',
    avatar: 'AR',
    avatarGrad: 'from-emerald-500 to-teal-500',
    score: 85,
    quote: 'Finally, insurance in plain Hindi — well, plain English at least! I used to just sign whatever the agent said. Now I actually understand what I\'m paying for.',
    policy: 'Niva Bupa Reassure',
  },
  {
    name: 'Karan Patel',
    role: 'CA, Ahmedabad',
    avatar: 'KP',
    avatarGrad: 'from-amber-500 to-orange-500',
    score: 72,
    quote: 'As a CA I\'ve seen clients lose lakhs because they didn\'t read the fine print. SpashtAI should be mandatory before buying any policy. The comparison tool is especially powerful.',
    policy: 'ICICI Lombard iHealth',
  },
  {
    name: 'Sneha Iyer',
    role: 'Startup Founder, Chennai',
    avatar: 'SI',
    avatarGrad: 'from-violet-500 to-purple-500',
    score: 69,
    quote: 'I compared two family floater policies in minutes. The AI picked up that Policy B had a sublimit on room rent that would have cost me ₹40,000 more. Insane value.',
    policy: 'Care Health Supreme',
  },
  {
    name: 'Vikram Singh',
    role: 'Army Officer, Pune',
    avatar: 'VS',
    avatarGrad: 'from-cyan-500 to-sky-500',
    score: 91,
    quote: 'My regiment uses group insurance but I also have a personal plan. SpashtAI helped me identify exactly where the overlap is and where I had gaps. Highly recommended.',
    policy: 'ECHS + Personal Plan',
  },
];

const values = [
  {
    icon: Eye,
    title: 'Radical Transparency',
    description: 'We decode every clause, sub-limit, and exclusion in plain language. No jargon, no agent spin — just the truth about what you own.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/12 border-blue-500/20',
    glow: '0 0 40px rgba(59,130,246,0.08)',
  },
  {
    icon: Zap,
    title: 'AI-Powered Speed',
    description: 'Gemini 2.5 Flash reads your entire policy PDF in seconds and cross-references it against your personal profile to surface what actually matters.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/12 border-yellow-500/20',
    glow: '0 0 40px rgba(234,179,8,0.08)',
  },
  {
    icon: ShieldCheck,
    title: 'Your Data, Protected',
    description: 'Your policy PDFs are processed for analysis only and never stored on our servers. Your personal data lives in your own Firebase account.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/12 border-emerald-500/20',
    glow: '0 0 40px rgba(34,197,94,0.08)',
  },
];

const stats = [
  { value: '12,000+', label: 'Policies Analysed', icon: FileText },
  { value: '4.9/5', label: 'User Rating', icon: Star },
  { value: '₹2.4Cr', label: 'Claims Guided', icon: TrendingUp },
  { value: '8,500+', label: 'Happy Users', icon: Users },
];

function fadeUp(delay = 0) {
  return { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { delay, duration: 0.5 } };
}

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-1/3 w-[700px] h-[400px] rounded-full bg-blue-700/7 blur-[160px]" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[350px] rounded-full bg-purple-700/6 blur-[140px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] rounded-full bg-emerald-700/4 blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-6 relative z-10">

        {/* ── Hero ── */}
        <section className="pt-12 pb-16 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold text-blue-300 uppercase tracking-widest" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <ShieldCheck className="w-3.5 h-3.5" />
              India's Transparency-First Insurance Platform
            </div>
          </motion.div>

          <motion.h1 {...fadeUp(0.06)} className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-5">
            Insurance finally<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">makes sense.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.12)} className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            SpashtAI was built because millions of Indians pay for policies they don't understand, 
            and find out what's not covered only when they need it most. We're changing that.
          </motion.p>

          <motion.div {...fadeUp(0.16)} className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => router.push('/policy-insights')}
              className="px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 28px rgba(99,102,241,0.4)' }}
            >
              Analyse My Policy
            </button>
            <button
              onClick={() => router.push('/compare')}
              className="px-7 py-3.5 rounded-full text-sm font-semibold text-gray-300 hover:text-white border border-white/12 hover:bg-white/6 transition-all"
            >
              Compare Policies
            </button>
          </motion.div>
        </section>

        {/* ── Stats ── */}
        <motion.section {...fadeUp(0.05)} className="mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div key={label} {...fadeUp(i * 0.07)} className="rounded-[1.5rem] p-5 text-center" style={glassCard}>
                <div className="w-10 h-10 rounded-xl bg-blue-500/12 border border-blue-500/20 mx-auto flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white mb-1">{value}</div>
                <div className="text-xs text-gray-600 uppercase tracking-wider">{label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Our Values ── */}
        <section className="mb-16">
          <motion.div {...fadeUp(0)} className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">What we stand for</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">Built on three principles</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {values.map(({ icon: Icon, title, description, color, bg, glow }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.1)} className={`rounded-[1.5rem] p-6 border ${bg}`} style={{ boxShadow: glow }}>
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 border`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Story ── */}
        <motion.section {...fadeUp(0.05)} className="mb-16">
          <div className="rounded-[2rem] p-8 md:p-10" style={glassCard}>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-4">Our Story</p>
              <h2 className="text-2xl font-black text-white mb-5">Born from frustration, built with empathy</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Our founder's family lost a critical claim because a pre-existing condition clause was buried in page 47 of a 60-page policy document. 
                The agent never mentioned it. The insurer was technically right.
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                That experience sparked SpashtAI — <em className="text-gray-300 not-italic font-semibold">"Spasht"</em> meaning "clear" in Hindi. 
                We partnered with Gemini AI to build a tool that reads every line of your policy and explains it in language your parents could understand.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Because transparency shouldn't be a luxury. It should be the default.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ── Testimonials ── */}
        <section className="mb-16">
          <motion.div {...fadeUp(0)} className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-gray-600 font-semibold mb-2">Real users, real outcomes</p>
            <h2 className="text-2xl md:text-3xl font-black text-white">What our community says</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => {
              const scoreGrad = t.score >= 75 ? 'from-emerald-500 to-teal-400' : t.score >= 50 ? 'from-amber-500 to-yellow-400' : 'from-red-500 to-rose-400';
              return (
                <motion.div key={t.name} {...fadeUp(i * 0.07)} className="rounded-[1.5rem] p-5 flex flex-col gap-4" style={glassCard}>
                  {/* Quote icon */}
                  <Quote className="w-5 h-5 text-blue-500/50" />

                  {/* Quote text */}
                  <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>

                  {/* Policy + score */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-medium text-gray-500" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {t.policy}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className={`text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r ${scoreGrad}`}>{t.score}</span>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/6">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white bg-gradient-to-br ${t.avatarGrad} shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold leading-tight">{t.name}</p>
                      <p className="text-gray-600 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <motion.section {...fadeUp(0.05)} className="text-center">
          <div className="rounded-[2rem] p-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.15) 100%)', border: '1px solid rgba(99,130,255,0.18)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 relative">Ready to know your policy inside out?</h2>
            <p className="text-gray-400 mb-7 max-w-md mx-auto relative">Upload your PDF. Get clarity in 30 seconds. No jargon, no agent, no surprises.</p>
            <button
              onClick={() => router.push('/policy-insights')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white hover:scale-105 transition-transform relative"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 0 32px rgba(99,102,241,0.45)' }}
            >
              Start Free Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
