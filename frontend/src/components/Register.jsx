import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const initialForm = {
  nome: '', sobrenome: '', email: '', senha: '', confirmarSenha: '',
  tipo_usuario: 'producer', telefone: '',
  cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '', complemento: '',
};

export function Register({ onBack, onLogin, t }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validateStep1 = () => {
    if (!form.nome.trim() || !form.sobrenome.trim() || !form.email.trim() || !form.senha) {
      setError('Preencha todos os campos obrigatórios.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Email inválido.');
      return false;
    }
    if (form.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas não conferem.');
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({
        nome: form.nome,
        sobrenome: form.sobrenome,
        email: form.email,
        senha: form.senha,
        tipo_usuario: form.tipo_usuario,
        telefone: form.telefone || null,
        cep: form.cep || null,
        logradouro: form.logradouro || null,
        numero: form.numero || null,
        complemento: form.complemento || null,
        bairro: form.bairro || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
      });
      // On success, authService already saved token — redirect to lab
      onLogin && onLogin();
    } catch (err) {
      setError(err.detail || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-300 dark:border-slate-700 rounded-sm focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-sm";
  const labelCls = "text-[10px] lg:text-xs font-semibold text-slate-700 dark:text-slate-300";

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-white dark:bg-slate-950 overflow-hidden relative">
      {/* Left side: branding/hero */}
      <motion.div 
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex w-full lg:w-1/2 bg-[#10b981] py-8 px-6 lg:p-12 flex-col justify-center relative overflow-hidden z-10 shrink-0"
      >
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -100, 50, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#065f46] rounded-full filter blur-[100px] opacity-85" />
          <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 100, -50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#34d399] rounded-full filter blur-[100px] opacity-85" />
        </div>

        <div className="relative mb-2 lg:mb-6 lg:absolute lg:top-12 lg:left-12 z-20">
          <button onClick={onBack} className="flex items-center gap-2 bg-white text-[#10b981] px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg font-bold text-xs lg:text-sm tracking-wide shadow-sm hover:scale-105 transition-transform">
            <Leaf size={16} />
            AgroGemini
          </button>
        </div>
        
        <div className="max-w-md mx-auto xl:mx-0 xl:ml-12 z-20">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="text-3xl lg:text-5xl font-black leading-tight tracking-tight mb-0.5 lg:mb-2 text-mesh-animated">
            {t.hero.titleLine1}
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="text-3xl lg:text-5xl font-black leading-tight tracking-tight text-mesh-animated" style={{ animationDelay: '-4s' }}>
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
        <div className="absolute inset-0 pointer-events-none -z-10">
          <motion.div animate={{ x: [0, 50, -50, 0], y: [0, 50, -50, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#10b981] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 dark:opacity-25" />
          <motion.div animate={{ x: [0, -50, 50, 0], y: [0, -50, 50, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#34d399] rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-40 dark:opacity-25" />
        </div>

        <div className="w-full max-w-[420px] lg:max-w-lg z-20 mx-auto">
          <h2 className="text-xl lg:text-3xl font-bold mb-1 text-slate-900 dark:text-white tracking-tight text-center lg:text-left">{t.register.title}</h2>
          <p className="hidden lg:block text-slate-500 dark:text-slate-400 mb-6 text-sm">{t.register.subtitle}</p>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-xs lg:text-sm">
              {error}
            </motion.div>
          )}

          <form className="w-full mt-2 lg:mt-0" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-2 lg:space-y-4">
                  <h3 className="hidden lg:block text-lg font-bold text-[#10b981] pb-2 border-b border-slate-100 dark:border-slate-800">{t.register.personalInfo}</h3>
                  
                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.firstName}</label>
                      <input type="text" value={form.nome} onChange={set('nome')} placeholder={t.register.firstNameHint} className={inputCls} />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.lastName}</label>
                      <input type="text" value={form.sobrenome} onChange={set('sobrenome')} placeholder={t.register.lastNameHint} className={inputCls} />
                    </div>
                  </div>

                  <div className="space-y-0.5 lg:space-y-2">
                    <label className={labelCls}>{t.register.email}</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder={t.register.emailHint} className={inputCls} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.phone}</label>
                      <input type="tel" value={form.telefone} onChange={set('telefone')} placeholder={t.register.phoneHint} className={inputCls} />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.userType}</label>
                      <select value={form.tipo_usuario} onChange={set('tipo_usuario')} className={`${inputCls} h-[30px] lg:h-[38px]`}>
                        <option value="producer">{t.register.typeFarmer}</option>
                        <option value="lab">{t.register.typeLab}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.password}</label>
                      <input type="password" value={form.senha} onChange={set('senha')} placeholder="••••••••" className={inputCls} />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.confirmPassword}</label>
                      <input type="password" value={form.confirmarSenha} onChange={set('confirmarSenha')} placeholder="••••••••" className={inputCls} />
                    </div>
                  </div>

                  <div className="pt-2 lg:pt-6">
                    <motion.button type="button" onClick={handleNext}
                      whileHover={{ scale: 1.02, boxShadow: "0px 0px 20px rgba(16, 185, 129, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden w-full py-2.5 lg:py-4 text-sm lg:text-base bg-[#10b981] text-white rounded-sm font-semibold transition-all shadow-md flex justify-center items-center gap-2 group">
                      <div className="absolute inset-0 w-1/4 h-full bg-white opacity-20 skew-x-[45deg] -translate-x-[150%] group-hover:translate-x-[500%] transition-transform duration-700 ease-out" />
                      {t.register.nextStep} &rarr;
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="space-y-2 lg:space-y-4">
                  <h3 className="hidden lg:flex text-lg font-bold text-[#10b981] pb-2 border-b border-slate-100 dark:border-slate-800 items-center gap-2">
                    <button type="button" onClick={() => setStep(1)} className="text-slate-400 hover:text-[#10b981] transition-colors p-1" title={t.register.prevStep}>&larr;</button>
                    {t.register.addressInfo}
                  </h3>
                  <div className="lg:hidden flex items-center mb-2">
                    <button type="button" onClick={() => setStep(1)} className="text-[#10b981] flex items-center text-sm font-bold"> &larr; {t.register.prevStep}</button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2 col-span-1">
                      <label className={labelCls}>{t.register.zipcode}</label>
                      <input type="text" value={form.cep} onChange={set('cep')} placeholder={t.register.zipcodeHint} className={inputCls} />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2 col-span-3">
                      <label className={labelCls}>{t.register.street}</label>
                      <input type="text" value={form.logradouro} onChange={set('logradouro')} placeholder={t.register.streetHint} className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 lg:gap-4">
                    <div className="space-y-0.5 lg:space-y-2 col-span-1">
                      <label className={labelCls}>{t.register.number}</label>
                      <input type="text" value={form.numero} onChange={set('numero')} placeholder={t.register.numberHint} className={inputCls} />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2 col-span-3">
                      <label className={labelCls}>{t.register.neighborhood}</label>
                      <input type="text" value={form.bairro} onChange={set('bairro')} placeholder={t.register.neighborhoodHint} className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:gap-4">
                     <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.city}</label>
                      <input type="text" value={form.cidade} onChange={set('cidade')} placeholder={t.register.cityHint} className={inputCls} />
                    </div>
                    <div className="space-y-0.5 lg:space-y-2">
                      <label className={labelCls}>{t.register.state}</label>
                      <input type="text" value={form.estado} onChange={set('estado')} placeholder={t.register.stateHint} className={inputCls} />
                    </div>
                  </div>

                  <div className="space-y-0.5 lg:space-y-2">
                    <label className={labelCls}>{t.register.complement}</label>
                    <input type="text" value={form.complemento} onChange={set('complemento')} placeholder={t.register.complementHint} className={inputCls} />
                  </div>

                  <div className="pt-2 lg:pt-6">
                    <motion.button type="submit" disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02, boxShadow: "0px 0px 20px rgba(16, 185, 129, 0.5)" }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden w-full py-2.5 lg:py-4 text-sm lg:text-base bg-[#10b981] text-white rounded-sm font-semibold transition-all shadow-md group disabled:opacity-70 disabled:cursor-not-allowed">
                      <div className="absolute inset-0 w-1/4 h-full bg-white opacity-20 skew-x-[45deg] -translate-x-[150%] group-hover:translate-x-[500%] transition-transform duration-700 ease-out" />
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin" />
                          Criando conta...
                        </span>
                      ) : t.register.submit}
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
