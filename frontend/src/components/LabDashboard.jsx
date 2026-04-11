import React from 'react';
import { FileText, CheckCircle2, AlertCircle, TrendingUp, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockSamples } from '../mockData';

export function LabDashboard({ t, onViewDetails }) {
  const stats = [
    { title: t.portal.dashboard.totalSamples, value: "1,802", icon: FileText, color: "text-[#10b981]", bg: "bg-[#10b981]", trend: "+12.5%" },
    { title: t.portal.dashboard.processedToday, value: "23", icon: CheckCircle2, color: "text-[#10b981]", bg: "bg-[#10b981]", trend: "+8.3%" },
    { title: t.portal.dashboard.pending, value: "4", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500", trend: "-15.2%", trendDown: true },
    { title: t.portal.dashboard.avgHealth, value: "82%", icon: TrendingUp, color: "text-[#10b981]", bg: "bg-[#10b981]", trend: "+3.1%" },
  ];

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
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm`}>
                  <Icon size={20} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 ${stat.trendDown ? 'text-slate-500' : 'text-[#10b981]'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Samples Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="text-[#10b981]" size={20} />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{t.portal.dashboard.recentSamples}</h3>
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
                <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t.portal.dashboard.headers.status}</th>
                <th className="py-4 px-6 text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">{t.portal.dashboard.headers.health}</th>
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
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusStyle(sample.status)}`}>
                      {getStatusIcon(sample.status)}
                      {t.portal.dashboard.status[sample.status]}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <HealthBar value={sample.health} />
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
