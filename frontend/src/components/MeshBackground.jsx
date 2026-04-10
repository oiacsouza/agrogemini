import { motion } from 'framer-motion';

export function MeshBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden transition-colors duration-500 pointer-events-none -z-50" style={{ backgroundColor: 'var(--mesh-bg-base)' }}>
       <motion.div
         animate={{
           x: [0, "40vw", "-20vw", 0],
           y: [0, "-30vh", "20vh", 0],
           scale: [1, 1.3, 0.8, 1],
         }}
         transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
         className="absolute top-[-20%] left-[-10%] w-[75vw] h-[75vw] rounded-full blur-[140px]"
         style={{ backgroundColor: 'var(--mesh-blob1)' }}
       />
       <motion.div
         animate={{
           x: [0, "-30vw", "40vw", 0],
           y: [0, "40vh", "-30vh", 0],
           scale: [1, 0.8, 1.2, 1],
         }}
         transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
         className="absolute top-[30%] right-[-15%] w-[85vw] h-[85vw] rounded-full blur-[160px]"
         style={{ backgroundColor: 'var(--mesh-blob2)' }}
       />
       <motion.div
         animate={{
           x: ["20vw", 0, "-40vw", "20vw"],
           y: ["20vh", "-40vh", 0, "20vh"],
           scale: [0.8, 1, 1.4, 0.8],
         }}
         transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
         className="absolute bottom-[-20%] left-[20%] w-[65vw] h-[65vw] rounded-full blur-[120px]"
         style={{ backgroundColor: 'var(--mesh-blob3)' }}
       />
       <div className="absolute inset-0 backdrop-blur-[50px] transition-colors duration-500" style={{ backgroundColor: 'var(--mesh-overlay)' }} /> 
    </div>
  );
}
