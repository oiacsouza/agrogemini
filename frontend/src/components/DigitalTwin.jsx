import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, RoundedBox } from '@react-three/drei';

function SoilBlock(props) {
  const meshRef = useRef();

  // Spin the block slowly
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <RoundedBox args={[3, 3, 3]} radius={0.2} smoothness={4} ref={meshRef} {...props}>
      <meshStandardMaterial 
        color="#3d2a1d" 
        roughness={0.9} 
        metalness={0.1} 
      />
    </RoundedBox>
  );
}

export function DigitalTwin() {
  return (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] relative z-20">
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        <SoilBlock position={[0, -0.5, 0]} />
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
      
      {/* Decorative scanning effects on top of the 3D model */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-full h-[60%] border-t-2 border-b-2 border-emerald-500/30 dark:border-emerald-500/50 relative overflow-hidden flex flex-col justify-between py-4">
          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 absolute top-2 left-4">Z-AXIS: -12.4m</div>
          <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 absolute bottom-2 right-4">N: 45% | P: 12% | K: 43%</div>
        </div>
      </div>
    </div>
  );
}
