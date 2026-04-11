import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Upload } from 'lucide-react';

export function LabImport({ t }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Upload className="text-[#10b981]" size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{t.portal.import.cardTitle}</h3>
        </div>

        <div className="p-8 lg:p-12">
          <div className="border-2 border-dashed border-[#10b981] rounded-2xl p-16 flex flex-col items-center justify-center bg-[#10b981]/5 dark:bg-[#10b981]/10 hover:bg-[#10b981]/10 dark:hover:bg-[#10b981]/20 transition-colors cursor-pointer group">
            
            <div className="w-16 h-16 bg-[#10b981]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="text-[#10b981]" size={32} />
            </div>
            
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              {t.portal.import.dragDrop}
            </h4>
            
            <p className="text-sm text-slate-500 mb-6">
              {t.portal.import.orClick}
            </p>
            
            <button className="bg-[#10b981] hover:bg-[#0ea5e9] text-white px-8 py-3 rounded-lg font-bold text-sm shadow-sm transition-colors cursor-pointer z-10 w-48">
              {t.portal.import.selectFiles}
            </button>

            <p className="mt-8 text-xs text-slate-400 font-medium tracking-wide">
              {t.portal.import.featuresFooter}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
