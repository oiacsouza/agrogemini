import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export function Login({ onBack, onRegister, onLogin, t }) {
  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-white dark:bg-slate-950 overflow-hidden relative">
      {/* Left side: branding/hero */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full lg:w-1/2 bg-[#10b981] py-8 px-6 lg:p-12 flex-col justify-center relative overflow-hidden z-10 shrink-0"
      >
        {/* Animated mesh blobs for left side */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div 
            animate={{ x: [0, 100, -50, 0], y: [0, -100, 50, 0] }} 
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#065f46] rounded-full filter blur-[100px] opacity-85" 
          />
          <motion.div 
            animate={{ x: [0, -100, 50, 0], y: [0, 100, -50, 0] }} 
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#34d399] rounded-full filter blur-[100px] opacity-85" 
          />
        </div>

        <div className="relative mb-2 lg:mb-6 lg:absolute lg:top-12 lg:left-12 z-20">
          <button onClick={onBack} className="flex items-center gap-2 bg-white text-[#10b981] px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg font-bold text-xs lg:text-sm tracking-wide shadow-sm hover:scale-105 transition-transform">
            <Leaf size={16} />
            AgroGemini
          </button>
        </div>
        
        <div className="max-w-md mx-auto xl:mx-0 xl:ml-12 z-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl lg:text-5xl font-black leading-tight tracking-tight mb-0.5 lg:mb-2 text-mesh-animated"
          >
            {t.hero.titleLine1}
          </motion.h1>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl lg:text-5xl font-black leading-tight tracking-tight text-mesh-animated"
            style={{ animationDelay: '-4s' }}
          >
            {t.hero.titleLine2}
          </motion.h1>
        </div>
      </motion.div>

      {/* Right side: Login form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center p-6 lg:p-8 pt-10 lg:pt-8 bg-white dark:bg-slate-950 relative overflow-hidden z-10 flex-grow"
      >
        {/* Animated mesh blobs for right side */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div 
            animate={{ x: [0, 50, -50, 0], y: [0, 50, -50, 0] }} 
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} 
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#10b981] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 dark:opacity-25" 
          />
          <motion.div 
            animate={{ x: [0, -50, 50, 0], y: [0, -50, 50, 0] }} 
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} 
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#34d399] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 dark:opacity-25" 
          />
        </div>

        <div className="w-full max-w-sm z-20">
          <h2 className="text-xl lg:text-3xl font-bold mb-6 lg:mb-10 text-slate-900 dark:text-white tracking-tight">{t.login.title}</h2>
          
          <form className="space-y-4 lg:space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin && onLogin(); }}>
            <div className="space-y-1 lg:space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.login.emailLabel}</label>
              <input 
                type="text"
                placeholder={t.login.emailPlaceholder} 
                className="w-full px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:ring-1 focus:border-[#10b981] focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm"
              />
            </div>
            
            <div className="space-y-1 lg:space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.login.passwordLabel}</label>
              <input 
                type="password"
                placeholder="••••••••" 
                className="w-full px-3 py-2 lg:px-4 lg:py-3 text-sm lg:text-base border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:ring-1 focus:border-[#10b981] focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm"
              />
            </div>

            <div className="pt-2">
              <motion.button 
                whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(16, 185, 129, 0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden w-full py-2.5 lg:py-3 text-sm lg:text-base bg-[#10b981] text-white rounded-sm font-semibold transition-all shadow-md group"
              >
                <div className="absolute inset-0 w-1/4 h-full bg-white opacity-20 skew-x-[45deg] -translate-x-[150%] group-hover:translate-x-[500%] transition-transform duration-700 ease-out" />
                {t.login.submit}
              </motion.button>
            </div>
          </form>

          <div className="mt-4 lg:mt-6 flex flex-col gap-2 mx-auto justify-center">
            <a href="#" className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 hover:text-[#10b981] transition-colors w-fit mx-auto lg:mx-0">{t.login.forgotPassword}</a>
            <button onClick={onRegister} className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 hover:text-[#10b981] transition-colors w-fit text-left mx-auto lg:mx-0">{t.login.signUp}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
