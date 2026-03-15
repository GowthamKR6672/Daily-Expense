import React from 'react';

const MaintenanceScreen = ({ mode }) => {
  const is404 = mode === '404';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 overflow-hidden relative
      ${is404 ? 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900' : 'bg-gradient-to-br from-red-950 via-red-900 to-orange-900'}
    `}>
      {/* Floating orbs background */}
      <div className={`absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse
        ${is404 ? 'bg-indigo-400' : 'bg-red-400'}`} />
      <div className={`absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse delay-1000
        ${is404 ? 'bg-purple-400' : 'bg-orange-400'}`} />

      {/* Grid lines */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 text-center max-w-lg">
        {/* Animated error code */}
        <div className="mb-6 relative">
          <div className={`text-[160px] font-black leading-none select-none
            ${is404
              ? 'text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-200 to-indigo-500'
              : 'text-transparent bg-clip-text bg-gradient-to-b from-white via-red-200 to-red-500'
            }`}
            style={{ animation: 'glitch 3s infinite', textShadow: 'none' }}
          >
            {is404 ? '404' : '500'}
          </div>

          {/* Glitch copy layers */}
          <div className={`absolute inset-0 text-[160px] font-black leading-none select-none opacity-40
            ${is404 ? 'text-cyan-400' : 'text-orange-400'}`}
            style={{ animation: 'glitch-offset 3s infinite 0.05s', clipPath: 'inset(20% 0 60% 0)' }}
          >
            {is404 ? '404' : '500'}
          </div>
          <div className={`absolute inset-0 text-[160px] font-black leading-none select-none opacity-40
            ${is404 ? 'text-purple-400' : 'text-red-300'}`}
            style={{ animation: 'glitch-offset 3s infinite 0.1s', clipPath: 'inset(60% 0 20% 0)' }}
          >
            {is404 ? '404' : '500'}
          </div>
        </div>

        {/* Icon */}
        <div className={`text-6xl mb-6 animate-bounce`}>
          {is404 ? '🌐' : '⚠️'}
        </div>

        {/* Title */}
        <h1 className={`text-3xl font-bold text-white mb-3`}>
          {is404 ? 'Page Not Found' : 'Server Error'}
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-base leading-relaxed mb-8">
          {is404
            ? 'The page you are looking for has been moved, deleted, or never existed.'
            : 'Something went wrong on our end. Our team has been notified and is working to fix it.'}
        </p>

        {/* Animated status bar */}
        <div className="bg-white/10 rounded-full h-1.5 w-full mb-2 overflow-hidden">
          <div className={`h-full rounded-full ${is404 ? 'bg-indigo-400' : 'bg-red-400'}`}
            style={{ animation: 'scan 2s ease-in-out infinite', width: '40%' }} />
        </div>
        <p className="text-white/30 text-xs">
          {is404 ? 'Route resolution failed' : 'Internal server exception detected'}
        </p>

        {/* Error badge */}
        <div className={`mt-8 inline-flex items-center gap-2 text-xs font-mono px-4 py-2 rounded-full border
          ${is404
            ? 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10'
            : 'text-red-300 border-red-500/40 bg-red-500/10'
          }`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${is404 ? 'bg-indigo-400' : 'bg-red-400'}`} />
          {is404 ? 'ERR_404_NOT_FOUND' : 'ERR_500_INTERNAL_SERVER'}
        </div>
      </div>

      <style>{`
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0); }
          91% { transform: translate(-4px, 2px); }
          93% { transform: translate(4px, -2px); }
          95% { transform: translate(-2px, 4px); }
          97% { transform: translate(2px, -4px); }
        }
        @keyframes glitch-offset {
          0%, 90%, 100% { transform: translate(0); }
          91% { transform: translate(4px, -2px); }
          93% { transform: translate(-4px, 2px); }
          95% { transform: translate(2px, 4px); }
          97% { transform: translate(-2px, -4px); }
        }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
};

export default MaintenanceScreen;
