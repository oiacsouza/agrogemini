import { motion } from 'framer-motion';

export function MeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden transition-colors duration-500 pointer-events-none -z-50" style={{ backgroundColor: 'var(--mesh-bg-base)' }}>
       <motion.div
         animate={{
           x: [0, "40vw", "-20vw", 0],
           y: [0, "-30vh", "20vh", 0],
           scale: [1, 1.4, 0.8, 1],
           rotate: [0, 90, 180, 360],
         }}
         transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
         className="absolute top-[-20%] left-[-10%] w-[75vw] h-[75vw] rounded-[40%] blur-[140px] opacity-80"
         style={{ backgroundColor: 'var(--mesh-blob1)' }}
       />
       <motion.div
         animate={{
           x: [0, "-30vw", "40vw", 0],
           y: [0, "40vh", "-30vh", 0],
           scale: [1, 0.7, 1.3, 1],
           rotate: [360, 180, 90, 0],
         }}
         transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
         className="absolute top-[30%] right-[-15%] w-[85vw] h-[85vw] rounded-[45%] blur-[160px] opacity-70"
         style={{ backgroundColor: 'var(--mesh-blob2)' }}
       />
       <motion.div
         animate={{
           x: ["20vw", 0, "-40vw", "20vw"],
           y: ["20vh", "-40vh", 0, "20vh"],
           scale: [0.8, 1.2, 1.5, 0.8],
           rotate: [0, -120, -240, -360],
         }}
         transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
         className="absolute bottom-[-20%] left-[20%] w-[65vw] h-[65vw] rounded-[50%] blur-[120px] opacity-80"
         style={{ backgroundColor: 'var(--mesh-blob3)' }}
       />
       <div className="absolute inset-0 backdrop-blur-[60px] transition-colors duration-700" style={{ backgroundColor: 'var(--mesh-overlay)' }} /> 
    </div>
  );
}
