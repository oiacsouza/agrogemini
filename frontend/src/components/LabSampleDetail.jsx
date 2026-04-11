import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockNutrientData, mockTrendData } from '../mockData';

export function LabSampleDetail({ t }) {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <BarChart3 className="text-[#10b981]" size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{t.portal.detail.nutrientAnalysis}</h3>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockNutrientData}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
              <Bar dataKey="current" name={t.portal.detail.currentLevel} fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="optimal" name={t.portal.detail.optimalLevel} fill="#dbeafe" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-8"
      >
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="text-[#10b981]" size={20} />
          <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{t.portal.detail.processingTrends}</h3>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mockTrendData}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
              <Line yAxisId="left" type="monotone" dataKey="samples" name={t.portal.detail.samplesLine} stroke="#22c55e" strokeWidth={3} dot={{r: 6, fill: '#22c55e', strokeWidth: 0}} activeDot={{r: 8}} />
              <Line yAxisId="right" type="monotone" dataKey="health" name={t.portal.dashboard.avgHealth} stroke="#0f172a" strokeWidth={3} dot={{r: 6, fill: '#0f172a', strokeWidth: 0}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
