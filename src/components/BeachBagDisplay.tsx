import React from 'react';
import { PackageOpen, Sparkles } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { generateDeterministicProfile } from '../lib/seededGenerator';

export const BeachBagDisplay: React.FC = () => {
  const { profile } = useGeneratorStore();
  const meta = generateDeterministicProfile(
    profile.name,
    profile.role || 'Full Stack',
    profile.tagline
  );

  return (
    <div className="w-full bg-[#07241C] border-3 border-[#111111] rounded-2xl p-4 shadow-comic">
      <div className="flex items-center justify-between mb-3 border-b-2 border-[#111111] pb-2">
        <div className="flex items-center gap-2">
          <PackageOpen className="w-4 h-4 text-[#F4C430]" />
          <span className="text-xs font-bold font-stamp uppercase tracking-widest text-[#F4C430]">
            UNLOCKED BEACH BAG MANIFEST
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8146B] text-white border border-[#111111]">
          SEED: {meta.visaCode}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {meta.beachBag.map((item, idx) => (
          <div
            key={item.name}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0B3B2E] border-2 border-[#111111] shadow-comic hover:scale-[1.02] transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F5EFE0] border border-[#111111] flex items-center justify-center text-lg flex-shrink-0">
              {item.emoji}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-[#F5EFE0] truncate">{item.name}</div>
              <div className="text-[10px] font-bold text-[#F4C430] uppercase font-stamp">
                {item.category} #{idx + 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 text-[11px] text-[#E4D8BE]/80 flex items-center gap-1.5 justify-center">
        <Sparkles className="w-3 h-3 text-[#F4C430]" />
        <span>Assigned deterministically from your name and stack — guaranteed unique in Goa!</span>
      </div>
    </div>
  );
};
