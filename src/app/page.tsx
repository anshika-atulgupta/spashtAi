'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldAlert, CheckCircle, FileText, Zap, Lock, AlertTriangle, Activity, X, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="relative w-full h-[100vh] min-h-[800px] overflow-hidden flex flex-col items-center justify-start">
        
        {/* Radial glow centred behind the hero text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[500px] rounded-full bg-blue-600/8 blur-[120px] translate-y-20" />
        </div>

        {/* Top Text Content */}
        <motion.div 
          initial="hidden" animate="visible" variants={stagger}
          className="relative z-10 flex flex-col items-center text-center mt-[15vh] px-4"
        >
           <motion.h1 variants={fadeIn} className="text-5xl md:text-[5.5rem] font-medium tracking-tight mb-6 text-white max-w-4xl leading-[1.1]">
              Elevate Your<br/>Policy Experience
           </motion.h1>
           <motion.p variants={fadeIn} className="text-gray-400 font-light max-w-sm text-[15px] leading-relaxed mb-8">
              Unlock your true policy coverage in a fully transparent environment, powered by SpashtAI
           </motion.p>
           <motion.div variants={fadeIn}>
             <Link href="/onboarding">
                <button className="bg-white text-black px-8 py-3.5 rounded-full text-[15px] font-semibold hover:bg-gray-100 transition-colors shadow-xl">
                  Sign Up & Analyze
                </button>
             </Link>
           </motion.div>
        </motion.div>

        {/* Left Floating Card */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
          className="hidden md:block absolute left-12 top-[60vh] z-10 glass-panel p-5 rounded-3xl w-72 border border-white/5 bg-white/[0.02] backdrop-blur-xl"
        >
           <div className="flex justify-between items-start mb-10">
             <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Analysis Pairs</span>
             <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform">
               <ArrowUpRight className="w-3 h-3 text-black" />
             </div>
           </div>
           <div className="flex justify-between items-end">
              <div>
                <div className="font-semibold text-white/90 text-sm leading-tight pb-0.5">Unparalleled</div>
                <div className="font-semibold text-white/90 text-sm leading-tight">Coverage Access</div>
              </div>
              <span className="text-gray-500 font-mono text-sm tracking-tighter">46%</span>
           </div>
        </motion.div>

        {/* Right Floating Card */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
          className="hidden md:block absolute right-12 top-[65vh] z-10 glass-panel p-5 rounded-3xl w-72 border border-white/5 bg-white/[0.02] backdrop-blur-xl"
        >
           <div className="flex justify-between items-start mb-6">
             <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Hidden Exclusions</span>
             <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform">
               <ArrowUpRight className="w-3 h-3 text-black" />
             </div>
           </div>
           <div className="text-[2.75rem] font-medium text-white mb-4 tracking-tighter leading-none">96%</div>
           <div className="w-full bg-gray-800/50 h-[3px] rounded-full relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{width: '96%'}}></div>
           </div>
        </motion.div>
      </section>

      {/* 2. Problem -> Solution Section */}
      <section className="w-full py-24 bg-black/50 border-t border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
            className="flex flex-col md:flex-row items-center justify-between gap-16"
          >
            <motion.div variants={fadeIn} className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/10 text-red-500 mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold">Insurance is confusing.</h2>
              <p className="text-gray-400 text-lg">
                Hidden clauses, confusing jargon, and unexpected out-of-pocket costs. Most people don't find out what their insurance actually covers until they're in the hospital.
              </p>
            </motion.div>
            
            <div className="flex items-center justify-center text-gray-600">
              <ArrowRight className="w-10 h-10 hidden md:block" />
            </div>

            <motion.div variants={fadeIn} className="flex-1 space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-green-500/10 text-green-500 mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold">SpashtAI makes it clear.</h2>
              <p className="text-gray-400 text-lg">
                We read the fine print for you. Upload your policy and our AI instantly breaks down what's covered, what isn't, and what your actual financial risk looks like.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="w-full py-24 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful insights at a glance</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to understand your true coverage.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <FileText className="w-10 h-10 text-primary mb-6" />
            <h3 className="text-xl font-bold mb-3">Coverage Visualizer</h3>
            <p className="text-gray-400">See exactly what medical procedures, room rents, and treatments are covered without reading a 50-page document.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
             <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <AlertTriangle className="w-10 h-10 text-red-400 mb-6" />
            <h3 className="text-xl font-bold mb-3">Not Covered Highlighter</h3>
            <p className="text-gray-400">We explicitly highlight the exclusions and waiting periods that standard summaries intentionally hide.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="glass-panel p-8 rounded-2xl relative overflow-hidden group hover:border-secondary/50 transition-colors">
             <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Activity className="w-10 h-10 text-secondary mb-6" />
            <h3 className="text-xl font-bold mb-3">Scenario Simulator</h3>
            <p className="text-gray-400">"What if I get Dengue?" Simulate real-world scenarios to see a breakdown of what you pay vs what insurance covers.</p>
          </motion.div>
        </div>
      </section>

      {/* 4. Demo Section */}
      <section id="demo" className="w-full py-24 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">See exactly what you pay in real scenarios.</h2>
              <p className="text-xl text-gray-400">Example: A week hospital stay for Dengue recovery. The bill is ₹1,00,000. Your policy claims "100% coverage", but is it true?</p>
              
              <ul className="space-y-4 mt-8">
                <li className="flex items-start gap-3">
                  <div className="min-w-6 mt-1 text-red-400"><X className="w-5 h-5" /></div>
                  <div><span className="font-semibold">Consumables (₹8,000)</span> — Not covered by most policies.</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="min-w-6 mt-1 text-red-400"><X className="w-5 h-5" /></div>
                  <div><span className="font-semibold">Room Rent Cap Exceeded (₹12,000)</span> — Resulting in proportional deduction.</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="min-w-6 mt-1 text-green-400"><CheckCircle className="w-5 h-5" /></div>
                  <div><span className="font-semibold text-white">Insurance covers: ₹80,000</span></div>
                </li>
              </ul>
            </div>

            <div className="flex-1 w-full max-w-md">
              <div className="glass-panel rounded-2xl p-6 border-t-4 border-t-primary">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Dengue Treatment Breakdown</h3>
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Billed</span>
                    <span className="font-mono">₹1,00,000</span>
                  </div>
                  <div className="w-full h-px bg-gray-800"></div>
                  <div className="flex justify-between text-sm text-red-400">
                    <span>You Pay (Out of pocket)</span>
                    <span className="font-mono font-bold">₹20,000</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Insurance Pays</span>
                    <span className="font-mono font-bold">₹80,000</span>
                  </div>
                </div>

                <div className="w-full bg-gray-800 rounded-full h-3 flex overflow-hidden">
                  <div className="bg-red-500 h-full" style={{ width: '20%' }}></div>
                  <div className="bg-green-500 h-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Insurance Score & 6. Trust */}
      <section className="w-full py-24 border-t border-gray-900 border-b">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16">
          <div className="text-center md:text-left space-y-6">
            <h2 className="text-3xl font-bold mb-4">Your Personalized <span className="text-gradient">Insurance Score</span></h2>
            <p className="text-gray-400 text-lg">We analyze your lifestyle, assets, and health alongside your policy to give you a clear 0-100 score. Know precisely if you're underinsured before a crisis hits.</p>
            <div className="text-6xl font-black text-white mt-8 tracking-tighter">84<span className="text-2xl text-gray-500 font-normal">/100</span></div>
            <p className="text-green-400 text-sm font-medium mt-2">Good coverage, but high out-of-pocket limits.</p>
          </div>

          <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center text-center">
            <Lock className="w-12 h-12 text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold mb-3">Your Data, Your Control.</h3>
            <p className="text-gray-400">SpashtAI uses enterprise-grade encryption. Your PDFs are analyzed seamlessly and never stored without your explicit consent. No spam. No hidden agents.</p>
          </div>
        </div>
      </section>

      {/* 7. Final CTA */}
      <section className="w-full py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold">Ready for absolute clarity?</h2>
          <p className="text-xl text-gray-400">Stop guessing. Upload your policy document now and get your AI breakdown in seconds.</p>
          <Link href="/onboarding" className="inline-block mt-4">
            <button className="bg-white text-black hover:bg-gray-200 px-10 py-5 rounded-full text-xl font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Upload Your Policy
            </button>
          </Link>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="w-full py-8 border-t border-gray-900 mt-auto text-center text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0 text-white">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold tracking-tight">Spasht<span className="text-secondary">AI</span></span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} SpashtAI. All clarity reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0 text-sm">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
