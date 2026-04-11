import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';

export function Register({ onBack, onLogin, t }) {
  const [step, setStep] = useState(1);

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

      {/* Right side: Register form */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-1/2 flex flex-col items-center justify-start lg:justify-center p-6 lg:p-8 pt-8 lg:pt-8 bg-white dark:bg-slate-950 relative overflow-hidden z-10 flex-grow"
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

        <div className="w-full max-w-[420px] lg:max-w-lg z-20 mx-auto">
          <h2 className="text-xl lg:text-3xl font-bold mb-1 text-slate-900 dark:text-white tracking-tight text-center lg:text-left">{t.register.title}</h2>
          <p className="hidden lg:block text-slate-500 dark:text-slate-400 mb-6 text-sm">{t.register.subtitle}</p>
          
          <form className="w-full mt-2 lg:mt-0" onSubmit={(e) => e.preventDefault()}>
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 lg:space-y-4"
                >
                  <h3 className="hidden lg:block text-lg font-bold text-[#10b981] pb-2 border-b border-slate-100 dark:border-slate-800">{t.register.personalInfo}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.firstName}</label>
                      <input type="text" placeholder={t.register.firstNameHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.lastName}</label>
                      <input type="text" placeholder={t.register.lastNameHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-0.5 lg:space-y-2">
                    <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.email}</label>
                    <input type="email" placeholder={t.register.emailHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.phone}</label>
                      <input type="tel" placeholder={t.register.phoneHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.userType}</label>
                      <select className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white transition-all shadow-sm h-[30px] lg:h-[38px]">
                        <option value="producer">{t.register.typeFarmer}</option>
                        <option value="lab">{t.register.typeLab}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.password}</label>
                      <input type="password" placeholder="••••••••" className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.confirmPassword}</label>
                      <input type="password" placeholder="••••••••" className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="pt-2 lg:pt-6">
                    <motion.button 
                      type="button"
                      onClick={() => setStep(2)}
                      whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(16, 185, 129, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden w-full py-2.5 lg:py-4 text-sm lg:text-base bg-[#10b981] text-white rounded-sm font-semibold transition-all shadow-md flex justify-center items-center gap-2 group"
                    >
                      <div className="absolute inset-0 w-1/4 h-full bg-white opacity-20 skew-x-[45deg] -translate-x-[150%] group-hover:translate-x-[500%] transition-transform duration-700 ease-out" />
                      {t.register.nextStep} &rarr;
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 lg:space-y-4"
                >
                  <h3 className="hidden lg:flex text-lg font-bold text-[#10b981] pb-2 border-b border-slate-100 dark:border-slate-800 items-center gap-2">
                    <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-[#10b981] transition-colors p-1" title={t.register.prevStep}>
                      &larr;
                    </button>
                    {t.register.addressInfo}
                  </h3>
                  <div className="lg:hidden flex items-center mb-2">
                    <button type="button" onClick={() => setStep(1)} className="text-[#10b981] flex items-center text-sm font-bold">
                       &larr; {t.register.prevStep}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2 col-span-1">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.zipcode}</label>
                      <input type="text" placeholder={t.register.zipcodeHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2 col-span-3">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.street}</label>
                      <input type="text" placeholder={t.register.streetHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2 col-span-1">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.number}</label>
                      <input type="text" placeholder={t.register.numberHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2 col-span-3">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.neighborhood}</label>
                      <input type="text" placeholder={t.register.neighborhoodHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                     <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.city}</label>
                      <input type="text" placeholder={t.register.cityHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.state}</label>
                      <input type="text" placeholder={t.register.stateHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                    </div>
                  </div>

                  <div className="space-y-0.5 lg:space-y-2">
                    <label className="text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300">{t.register.complement}</label>
                    <input type="text" placeholder={t.register.complementHint} className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm" />
                  </div>

                  <div className="pt-2 lg:pt-6">
                    <motion.button 
                      type="submit"
                      whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(16, 185, 129, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden w-full py-2.5 lg:py-4 text-sm lg:text-base bg-[#10b981] text-white rounded-sm font-semibold transition-all shadow-md group"
                    >
                      <div className="absolute inset-0 w-1/4 h-full bg-white opacity-20 skew-x-[45deg] -translate-x-[150%] group-hover:translate-x-[500%] transition-transform duration-700 ease-out" />
                      {t.register.submit}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 justify-center lg:border-t lg:border-slate-100 lg:dark:border-slate-800 pt-3 lg:pt-6 mt-3 lg:mt-6">
              <span className="text-xs lg:text-sm text-slate-600 dark:text-slate-400">{t.register.alreadyHaveAccount}</span>
              <button type="button" onClick={onLogin} className="text-xs lg:text-sm text-[#10b981] hover:text-[#065f46] transition-colors font-medium">
                {t.register.login}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
