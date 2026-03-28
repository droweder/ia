import React from 'react';

export const AuroraModalBackground: React.FC = () => {
  return (
    <>
      {/* Dark base background */}
      <div className="absolute inset-0 bg-[#0B0F19] z-[-2]" />

      {/* Animated Aurora Blobs - Scaled down for modal size */}
      <div className="absolute inset-0 overflow-hidden z-[-1] pointer-events-none opacity-50 dark:opacity-80">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-red-600/30 blur-[80px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
        <div className="absolute top-[20%] -right-[20%] w-[80%] h-[80%] bg-blue-600/30 blur-[80px] rounded-full mix-blend-screen animate-pulse duration-[7000ms]" />
        <div className="absolute -bottom-[30%] left-[20%] w-[70%] h-[70%] bg-yellow-500/20 blur-[80px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
      </div>

      {/* Optional glass overlay to soften the blobs slightly and make text readable */}
      <div className="absolute inset-0 bg-black/20 z-[-1]" />
    </>
  );
};
