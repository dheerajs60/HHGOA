import React from 'react';
import { Ticket, User, Users } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import type { CardFormat } from '../types/generator';

export const FormatToggle: React.FC = () => {
  const { format, setFormat } = useGeneratorStore();

  const options: { id: CardFormat; label: string; sub: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'boarding_pass',
      label: 'Builder ID',
      sub: 'Boarding Pass & Stub',
      icon: <Ticket className="w-5 h-5" />,
      badge: 'OFFICIAL',
    },
    {
      id: 'pfp',
      label: 'Passport PFP',
      sub: 'Circular Visa Stamp',
      icon: <User className="w-5 h-5" />,
      badge: '1:1 SQUARE',
    },
    {
      id: 'squad',
      label: 'Squad Frame',
      sub: '2-3 Teammate Party',
      icon: <Users className="w-5 h-5" />,
      badge: 'MULTI-CREW',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold font-stamp uppercase tracking-widest text-[#F4C430] flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-[#E8146B] animate-pulse" />
          SELECT YOUR PASSENGER FORMAT
        </label>
        <span className="text-[11px] font-mono-code text-[#E4D8BE]">INSTANT CLIENT-SIDE RENDER</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-[#07241C] border-3 border-[#111111] rounded-2xl shadow-comic">
        {options.map((opt) => {
          const isActive = format === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setFormat(opt.id)}
              className={`relative flex items-center sm:flex-col sm:text-center gap-3 sm:gap-1.5 p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-[#F5EFE0] text-[#111111] border-[#111111] shadow-comic-pink -translate-y-0.5'
                  : 'bg-[#0B3B2E] text-[#E4D8BE] border-transparent hover:border-[#F4C430]/50 hover:bg-[#0e4838]'
              }`}
            >
              {/* Badge */}
              {opt.badge && (
                <span
                  className={`absolute -top-2.5 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider font-stamp border ${
                    isActive
                      ? 'bg-[#E8146B] text-white border-[#111111]'
                      : 'bg-[#07241C] text-[#F4C430] border-[#F4C430]/40'
                  }`}
                >
                  {opt.badge}
                </span>
              )}

              {/* Icon */}
              <div
                className={`p-2 rounded-lg border-2 ${
                  isActive
                    ? 'bg-[#E8146B] text-[#F5EFE0] border-[#111111]'
                    : 'bg-[#07241C] text-[#F4C430] border-[#111111]'
                }`}
              >
                {opt.icon}
              </div>

              {/* Text */}
              <div className="text-left sm:text-center">
                <div className="font-display text-base tracking-wide leading-tight">
                  {opt.label}
                </div>
                <div className={`text-[11px] font-medium ${isActive ? 'text-[#0B3B2E]' : 'text-gray-400'}`}>
                  {opt.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
