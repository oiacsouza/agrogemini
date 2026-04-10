import React, { useRef } from 'react';
import { motion, useTransform, useMotionValue, useMotionValueEvent, animate } from 'framer-motion';

export function GrowingCrop({ progress }) {
  const smoothProgress = useMotionValue(0);
  const prevProgress = useRef(0);

  // Asymmetric tracking: Delay/Slow to grow, Fast to shrink
  useMotionValueEvent(progress, "change", (latest) => {
    const isScrollingDown = latest > prevProgress.current;
    
    // We update the prev tracker
    prevProgress.current = latest;

    if (isScrollingDown) {
      animate(smoothProgress, latest, { 
        type: "tween",
        duration: 4,
        ease: "easeOut",
        delay: 0.15 // Delay before starting trajectory
      });
    } else {
      animate(smoothProgress, latest, { 
        type: "tween", 
        duration: 0.1, // Practically instant reduction
        ease: "easeOut"
      });
    }
  });

  // Compressed zone: Animation completes entirely at 40% of the scroll journey 
  // (before the user can pass by the component)
  const baseLineDraw = useTransform(smoothProgress, [0.05, 0.15], [0, 1]);
  const stemDraw = useTransform(smoothProgress, [0.10, 0.25], [0, 1]);

  // Leaves pop out sequentially early on
  const leaf1Scale = useTransform(smoothProgress, [0.15, 0.20], [0, 1]);
  const leaf2Scale = useTransform(smoothProgress, [0.20, 0.25], [0, 1]);
  const leaf3Scale = useTransform(smoothProgress, [0.25, 0.30], [0, 1]);
  const leaf4Scale = useTransform(smoothProgress, [0.30, 0.35], [0, 1]);
  const flowerScale = useTransform(smoothProgress, [0.35, 0.40], [0, 1]);

  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative flex flex-col items-center justify-end overflow-hidden py-10">
      {/* Informative Floating text pieces linking growth to Data Storytelling */}
      <motion.div 
        className="absolute top-[20%] right-[5%] lg:right-[15%] text-xs lg:text-sm font-mono text-emerald-600 dark:text-emerald-400 z-10"
        style={{ opacity: leaf3Scale, y: useTransform(leaf3Scale, [0, 1], [20, 0]) }}
      >
        N: Ideal
      </motion.div>
      <motion.div 
        className="absolute top-[40%] left-[5%] lg:left-[10%] text-xs lg:text-sm font-mono text-emerald-600 dark:text-emerald-400 z-10"
        style={{ opacity: leaf2Scale, y: useTransform(leaf2Scale, [0, 1], [20, 0]) }}
      >
        P: 18% Absorvido
      </motion.div>
      <motion.div 
        className="absolute top-[65%] right-[10%] lg:right-[20%] text-xs lg:text-sm font-mono text-emerald-600 dark:text-emerald-400 z-10"
        style={{ opacity: leaf1Scale, y: useTransform(leaf1Scale, [0, 1], [20, 0]) }}
      >
        Umidade: 85%
      </motion.div>

      <svg 
        viewBox="0 0 200 400" 
        className="w-full h-full stroke-emerald-600 dark:stroke-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] z-0"
        fill="none" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Soil Base Line */}
        <motion.path 
          d="M 40 380 L 160 380 M 60 390 L 140 390 M 80 400 L 120 400" 
          strokeWidth="3" 
          strokeOpacity="0.4"
          style={{ pathLength: useTransform(smoothProgress, [0, 0.2], [0, 1]) }}
        />
        
        {/* Main Stem (growing bottom to top) */}
        <motion.path 
          d="M 100 380 Q 80 250 110 150 T 100 50" 
          strokeWidth="6" 
          style={{ pathLength: stemDraw }}
        />

        {/* Leaf 1 (Bottom Right) */}
        <motion.g style={{ scale: leaf1Scale, originX: "100px", originY: "300px" }}>
          <path d="M 100 300 C 130 300 150 280 150 260 C 120 250 105 270 100 300" fill="currentColor" fillOpacity="0.1" strokeWidth="2" />
          <path d="M 100 300 C 130 300 150 280 150 260" strokeDasharray="4 4" strokeOpacity="0.5" strokeWidth="2"/>
        </motion.g>

        {/* Leaf 2 (Middle Left) */}
        <motion.g style={{ scale: leaf2Scale, originX: "95px", originY: "230px" }}>
          <path d="M 95 230 C 60 230 40 210 40 190 C 70 180 85 200 95 230" fill="currentColor" fillOpacity="0.1" strokeWidth="2" />
          <path d="M 95 230 C 60 230 40 210 40 190" strokeDasharray="4 4" strokeOpacity="0.5" strokeWidth="2"/>
        </motion.g>

        {/* Leaf 3 (Top Right) */}
        <motion.g style={{ scale: leaf3Scale, originX: "110px", originY: "150px" }}>
          <path d="M 110 150 C 150 150 170 120 170 100 C 130 90 115 120 110 150" fill="currentColor" fillOpacity="0.1" strokeWidth="2"/>
          <path d="M 110 150 C 150 150 170 120 170 100" strokeDasharray="4 4" strokeOpacity="0.5" strokeWidth="2"/>
        </motion.g>

        {/* Leaf 4 (Top Left) */}
        <motion.g style={{ scale: leaf4Scale, originX: "105px", originY: "80px" }}>
          <path d="M 105 80 C 75 80 55 60 55 40 C 85 30 95 50 105 80" fill="currentColor" fillOpacity="0.1" strokeWidth="2"/>
          <path d="M 105 80 C 75 80 55 60 55 40" strokeDasharray="4 4" strokeOpacity="0.5" strokeWidth="2"/>
        </motion.g>

        {/* Top Growth Nodes (Yield) */}
        <motion.g style={{ scale: flowerScale, originX: "100px", originY: "50px" }}>
          <circle cx="100" cy="50" r="12" fill="currentColor" fillOpacity="0.2" strokeWidth="2" />
          <circle cx="100" cy="50" r="22" strokeDasharray="6 6" strokeOpacity="0.4" strokeWidth="2"/>
          <path d="M 100 25 L 100 35 M 100 65 L 100 75 M 75 50 L 85 50 M 115 50 L 125 50" strokeWidth="2" strokeOpacity="0.5" />
          <path d="M 85 35 L 92 42 M 115 65 L 108 58 M 85 65 L 92 58 M 115 35 L 108 42" strokeWidth="2" strokeOpacity="0.3" />
        </motion.g>
      </svg>
    </div>
  );
}
