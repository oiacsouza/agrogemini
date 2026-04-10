import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Hexagon, Circle, Droplets, Target, Triangle, Trees, Sun } from 'lucide-react';

const logos = [
  { icon: Leaf, name: 'Fazenda Tech' },
  { icon: Hexagon, name: 'AgroNova' },
  { icon: Circle, name: 'Global Solos' },
  { icon: Droplets, name: 'Gota Pura' },
  { icon: Target, name: 'Alvo Rural' },
  { icon: Triangle, name: 'Pico Cerrado' },
  { icon: Trees, name: 'EcoLavoura' },
  { icon: Sun, name: 'Luz do Campo' },
];

export function LogoCarousel() {
  return (
    <section 
      className="relative overflow-hidden bg-transparent"
      style={{ 
        padding: '30px 0', 
        margin: '25px 0',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
      }}
    >
      <div className="container mx-auto text-center" style={{ marginBottom: '15px' }}>
        <p className="text-[0.95rem] font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Nossos Clientes
        </p>
      </div>
      
      <div className="flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 55, repeat: Infinity }}
          className="flex min-w-max items-center gap-24 px-12"
        >
          {/* Triple the items to ensure the marquee never runs out of screen space during loop */}
          {[...logos, ...logos, ...logos].map((logo, idx) => {
            const Icon = logo.icon;
            return (
              <div 
                key={idx} 
                className="flex flex-col items-center justify-center gap-6 transition-all duration-300 opacity-40 hover:opacity-100 hover:scale-110 grayscale hover:grayscale-0"
                style={{ color: 'var(--text-dark)' }}
              >
                <Icon size={64} style={{ strokeWidth: 1.5 }} />
                <span className="text-xl font-bold tracking-tight">{logo.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
