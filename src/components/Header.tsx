import React from 'react';
import { Plane, Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';

export const Header: React.FC = () => {
  const { soundEnabled, setSoundEnabled } = useGeneratorStore();

  return (
    <header className="relative z-20 border-b-4 border-[#111111] bg-[#0B3B2E] text-[#F5EFE0] px-4 py-3 sm:px-6 sm:py-4 shadow-comic">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Event Branding & Flight Indicator */}
        <div className="flex items-center gap-3.5">
          {/* Circular Goa Badge */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#E8146B] border-3 border-[#111111] shadow-comic flex-shrink-0 animate-bounce hover:animate-none cursor-pointer">
            <span className="font-bold text-[#F4C430] text-xl select-none">गोवा</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-2xl sm:text-3xl text-[#F4C430] tracking-wider leading-none text-shadow-comic">
                HH GOA 2026
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#E8146B] text-white border border-[#111111] uppercase tracking-wider font-stamp">
                <Sparkles className="w-3 h-3 text-[#F4C430]" /> Boarding Pass to Paradise
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-[#E4D8BE] tracking-tight flex items-center gap-1.5 mt-0.5">
              <span>LESS NOISE. MORE SIGNAL.</span>
              <span className="text-[#F4C430]">●</span>
              <span>BUILD → SHIP → REPEAT</span>
            </p>
          </div>
        </div>

        {/* Right: Live Flight Status & Audio Toggles */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          {/* Airport Terminal Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07241C] border-2 border-[#111111] text-xs font-mono-code">
            <div className="flex items-center gap-1.5 text-[#F4C430]">
              <Plane className="w-4 h-4 animate-pulse" />
              <span className="font-bold">FLIGHT HH-2026</span>
            </div>
            <span className="text-gray-500">|</span>
            <div className="flex items-center gap-1.5 text-[#00E599]">
              <span className="w-2 h-2 rounded-full bg-[#00E599] animate-ping" />
              <span className="font-bold uppercase tracking-wider">GATE OPEN</span>
            </div>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5EFE0] text-[#111111] border-2 border-[#111111] font-bold text-xs shadow-comic hover:bg-[#F4C430] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title={soundEnabled ? 'Stamp Audio Enabled' : 'Stamp Audio Muted'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#E8146B]" />
                <span className="hidden sm:inline">SFX ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden sm:inline">SFX OFF</span>
              </>
            )}
          </button>

          {/* Verified Official Badge */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E8146B] text-white border-2 border-[#111111] font-display text-xs tracking-wider shadow-comic">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F4C430]" />
            OFFICIAL GENERATOR
          </div>
        </div>

      </div>
    </header>
  );
};
