import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockSamples } from '../mockData';

export function LabSamples({ t, onViewDetails }) {
  
  const getStatusStyle = (statusKey) => {
    switch(statusKey) {
      case 'concluido': return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
      case 'alerta': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'processando': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusIcon = (statusKey) => {
    switch(statusKey) {
      case 'concluido': return <CheckCircle2 size={12} />;
      case 'alerta': return <AlertCircle size={12} />;
      case 'processando': return <TrendingUp size={12} />;
      default: return null;
    }
  };

  const HealthBar = ({ value }) => {
    const color = value > 80 ? 'bg-[#10b981]' : value > 70 ? 'bg-amber-500' : 'bg-red-500';
    return (
      <div className="flex items-center gap-3">
        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-8">{value}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="text-[#10b981]" size={20} />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Amostras Analisadas</h3>
            <p className="text-xs text-slate-500">{t.portal.dashboard.recentSamplesText}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t.portal.dashboard.headers.date}</th>
                <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t.portal.dashboard.headers.producer}</th>
                <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t.portal.dashboard.headers.field}</th>
                <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t.portal.dashboard.headers.health}</th>
                <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase text-right">{t.portal.dashboard.headers.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockSamples.map((sample) => (
                <tr key={sample.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {sample.date}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${sample.producerColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                        {sample.initials}
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{sample.producer}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {sample.field}
                  </td>
                  <td className="py-4 px-6">
                    <HealthBar value={sample.health} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={onViewDetails}
                      className="text-[#10b981] font-bold text-sm hover:text-[#0ea5e9] transition-colors"
                    >
                      {t.portal.dashboard.viewDetails}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
