import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileSpreadsheet, MousePointer2, Sprout, MapPin } from 'lucide-react';

export function ProcessingSkeleton() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // Phase 0: init (Waiting + Cursor flying in)
      await new Promise(r => setTimeout(r, 1200));
      setPhase(1); // File dropped visually
      await new Promise(r => setTimeout(r, 600));
      setPhase(2); // Scanning starts
      await new Promise(r => setTimeout(r, 3800));
      setPhase(3); // Result locked forever
    };
    sequence();
  }, []);

  return (
    <div
      className="relative p-8 sm:p-10 w-full max-w-md min-h-[400px] rounded-3xl backdrop-blur-2xl shadow-xl overflow-hidden transition-colors duration-500 bg-[var(--skel-bg)] border border-[var(--skel-border)] flex flex-col justify-center"
      style={{ backgroundColor: 'var(--skel-bg)', border: '1px solid var(--skel-border)' }}
    >
      {/* Absolute floating cursor that slides in and vanishes */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            initial={{ x: 250, y: 180, opacity: 0 }}
            animate={{ x: 30, y: 30, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="absolute z-50 pointer-events-none"
            style={{ left: '50%', top: '50%', marginLeft: '-15px', marginTop: '-15px' }}
          >
            {/* The cursor holding a synthetic file spreadsheet */}
            <div className="relative flex flex-col items-center">
              <FileSpreadsheet className="text-emerald-500 mb-1 drop-shadow-lg bg-white dark:bg-black rounded-sm" size={26} />
              <MousePointer2 className="text-gray-900 dark:text-white drop-shadow-xl" size={32} fill="currentColor" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Upload Box (Phase 0 and 1) */}
        {phase <= 1 && (
          <motion.div
            key="upload"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 ${phase === 1 ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-400/30 dark:border-gray-600/30 bg-gray-500/5'}`}
          >
            <UploadCloud size={44} className={`mb-4 transition-colors duration-300 ${phase === 1 ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`} />
            <p className="text-sm font-medium text-center px-4" style={{ color: phase === 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
              {phase === 0 ? "Arraste análise de solo (.csv) ou clique aqui" : "Arquivo transferido!"}
            </p>
          </motion.div>
        )}

        {/* Processing State (Phase 2) */}
        {phase === 2 && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full h-full flex flex-col justify-center"
          >
            {/* Laser Scanning Line */}
            <motion.div
              animate={{ y: ["-30px", "230px", "-30px"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-[2px] shadow-[0_0_15px_#10b981] z-10"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)' }}
            />
            <div className="flex flex-col gap-6">
              {/* Mockup Profile / Title */}
              <div className="flex gap-4 items-center">
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-14 h-14 rounded-xl"
                  style={{ backgroundColor: 'var(--skel-blob)' }}
                />
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  className="w-36 h-5 rounded-md"
                  style={{ backgroundColor: 'var(--skel-line)' }}
                />
              </div>

              {/* Data lines */}
              <div className="space-y-3">
                {[80, 50, 70].map((widthPercent, idx) => (
                  <motion.div
                    key={idx}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2, delay: idx * 0.3 }}
                    className="h-3 rounded-md"
                    style={{ width: `${widthPercent}%`, backgroundColor: 'var(--skel-line)' }}
                  />
                ))}
              </div>

              <div className="mt-1 flex items-center justify-between text-xs font-mono tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                <p>Calculando...</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-5 h-5 border-2 border-t-transparent border-emerald-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Ultra-Clean Data Dashboard (Phase 3) */}
        {phase === 3 && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex flex-col space-y-8"
          >
            {/* Header: Zero borders, zero loud colors */}
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Localização</span>
                <p className="text-2xl font-light tracking-tight mt-1" style={{ color: 'var(--text-dark)' }}>Fazenda Cáceres</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 tracking-widest bg-emerald-500/10 px-2 py-1 rounded">SYNCED</span>
            </div>

            {/* Metrics: Pure Typography and Negative Space */}
            <div className="flex justify-between">
              <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-mono tracking-wider">pH</span>
                </div>
                <span className="text-3xl font-light tracking-tighter" style={{ color: 'var(--text-dark)' }}>6.4</span>
              </motion.div>

              <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-mono tracking-wider">Fósforo</span>
                </div>
                <span className="text-3xl font-light tracking-tighter" style={{ color: 'var(--text-dark)' }}>66</span>
              </motion.div>

              <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[10px] uppercase text-gray-400 dark:text-gray-500 font-mono tracking-wider">Potássio</span>
                </div>
                <span className="text-3xl font-light tracking-tighter" style={{ color: 'var(--text-dark)' }}>1.2</span>
              </motion.div>
            </div>

            {/* Minimalist Ultra-thin Bar */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col pt-2">
              <div className="flex justify-between text-[10px] uppercase font-mono text-gray-400 dark:text-gray-500 mb-3">
                <span>Recarga (P)</span>
                <span className="text-blue-500 font-bold">Alta</span>
              </div>
              <div className="relative w-full h-[3px] bg-gray-200 dark:bg-gray-800 rounded-full">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '85%' }}
                  transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 rounded-full"
                />
                <motion.div
                  initial={{ left: '0%' }}
                  animate={{ left: '85%' }}
                  transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
                  className="absolute top-1/2 -mt-[5px] w-2.5 h-2.5 bg-white dark:bg-gray-100 rounded-full shadow-md transform -translate-x-1/2"
                />
              </div>
            </motion.div>

            {/* Zero-Background Alert Typography */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col mt-auto pt-6">
              <span className="flex items-center gap-2 text-[11px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Solo Arenoso
              </span>
              <span className="text-[12px] leading-relaxed text-gray-500 dark:text-gray-400 pr-4">
                Ajustando a recomendação de adubação e parcelamento base para o talhão.
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
