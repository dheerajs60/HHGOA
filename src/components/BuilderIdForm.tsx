import React from 'react';
import { Sparkles, Terminal } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import type { BuilderRole } from '../types/generator';
import { generateDeterministicProfile } from '../lib/seededGenerator';

const ROLES: BuilderRole[] = [
  'Full Stack',
  'Frontend',
  'Backend',
  'AI / ML',
  'UI/UX Design',
  'Product / PM',
  'Infra / DevOps',
  'Web3 / Crypto',
  'Founder / Hacker',
];

export const BuilderIdForm: React.FC = () => {
  const { profile, setProfile } = useGeneratorStore();

  // Calculate live deterministic result as user types
  const deterministic = generateDeterministicProfile(
    profile.name,
    profile.role || 'Full Stack',
    profile.tagline
  );

  return (
    <div className="w-full bg-[#07241C] border-3 border-[#111111] rounded-2xl p-5 shadow-comic space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
        <label className="text-xs font-bold font-stamp uppercase tracking-widest text-[#F4C430] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#E8146B]" />
          <span>FLIGHT MANIFEST & BUILDER INFO</span>
        </label>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E8146B] text-white border border-[#111111]">
          DETERMINISTIC SEED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Passenger Name */}
        <div>
          <label className="block text-[11px] font-bold font-stamp text-[#E4D8BE] uppercase mb-1">
            Builder / Passenger Name
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
            placeholder="e.g. Alex Rivera"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3B2E] border-2 border-[#111111] text-[#F5EFE0] font-bold text-sm focus:border-[#F4C430] focus:outline-none shadow-comic"
          />
        </div>

        {/* X / Twitter Handle */}
        <div>
          <label className="block text-[11px] font-bold font-stamp text-[#E4D8BE] uppercase mb-1">
            X / Twitter Handle
          </label>
          <input
            type="text"
            value={profile.handle}
            onChange={(e) => setProfile({ handle: e.target.value })}
            placeholder="@yourhandle"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3B2E] border-2 border-[#111111] text-[#F5EFE0] font-bold text-sm focus:border-[#F4C430] focus:outline-none shadow-comic"
          />
        </div>
      </div>

      {/* Role / Stack Selection */}
      <div>
        <label className="block text-[11px] font-bold font-stamp text-[#E4D8BE] uppercase mb-1.5 flex items-center justify-between">
          <span>Primary Stack / Builder Role</span>
          <span className="text-[10px] text-[#F4C430]">Assigns Builder Class</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((r) => {
            const isSelected = profile.role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setProfile({ role: r })}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-stamp transition-all border ${
                  isSelected
                    ? 'bg-[#E8146B] text-white border-[#111111] shadow-comic -translate-y-0.5'
                    : 'bg-[#0B3B2E] text-[#E4D8BE] border-[#111111] hover:bg-[#0e4838]'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Freeform Stack or Project */}
      <div>
        <label className="block text-[11px] font-bold font-stamp text-[#E4D8BE] uppercase mb-1">
          Custom Tech Stack / Project Focus
        </label>
        <input
          type="text"
          value={profile.stackOrProject}
          onChange={(e) => setProfile({ stackOrProject: e.target.value })}
          placeholder="e.g. Next.js, Rust, Solana, PyTorch"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3B2E] border-2 border-[#111111] text-[#F5EFE0] font-bold text-sm focus:border-[#F4C430] focus:outline-none shadow-comic"
        />
      </div>

      {/* Origin Airport */}
      <div>
        <label className="block text-[11px] font-bold font-stamp text-[#E4D8BE] uppercase mb-1">
          Origin Airport Code(s)
        </label>
        <input
          type="text"
          value={profile.originAirport}
          onChange={(e) => setProfile({ originAirport: e.target.value })}
          placeholder="e.g. BLR / DEL / SFO / LON"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B3B2E] border-2 border-[#111111] text-[#F5EFE0] font-bold text-sm focus:border-[#F4C430] focus:outline-none shadow-comic"
        />
      </div>

      {/* Live Assignment Preview Box */}
      <div className="mt-4 p-3.5 rounded-xl bg-[#F5EFE0] border-2 border-[#111111] text-[#111111] shadow-comic">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="font-display tracking-wider text-[#0B3B2E] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E8146B]" />
            DETERMINISTIC ASSIGNMENT:
          </span>
          <span className="font-mono-code text-[11px] text-[#E8146B]">
            {deterministic.terminalCode}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
          <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#111111]">
            <span className="text-[10px] text-gray-500 block">ASSIGNED CLASS</span>
            <span className="font-display text-sm text-[#E8146B]">
              {deterministic.builderClass}
            </span>
          </div>

          <div className="bg-[#FFFFFF] p-2 rounded-lg border border-[#111111]">
            <span className="text-[10px] text-gray-500 block">GATE & SEAT</span>
            <span className="font-display text-sm text-[#0B3B2E]">
              {deterministic.gate} · {deterministic.seat}
            </span>
          </div>
        </div>

        {/* Beach Bag Perks Preview */}
        <div className="mt-2 pt-2 border-t border-gray-300">
          <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">
            UNLOCKED BEACH BAG MANIFEST:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {deterministic.beachBag.map((item) => (
              <span
                key={item.name}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B3B2E] text-[#F5EFE0] text-[11px] font-bold"
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
