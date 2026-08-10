import React, { useRef } from 'react';
import { Users, Plus, Trash2, Upload, CheckCircle2 } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { convertHeicIfNeeded } from '../lib/heicConvert';

export const SquadFrameBuilder: React.FC = () => {
  const {
    squadMembers,
    activeSquadMemberIndex,
    setActiveSquadMemberIndex,
    setSquadMemberImage,
    setSquadMemberInfo,
    addSquadMember,
    removeSquadMember,
  } = useGeneratorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentMember = squadMembers[activeSquadMemberIndex] || squadMembers[0];

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const dataUrl = await convertHeicIfNeeded(e.target.files[0]);
      setSquadMemberImage(activeSquadMemberIndex, dataUrl);
    }
  };

  return (
    <div className="w-full bg-[#07241C] border-3 border-[#111111] rounded-2xl p-5 shadow-comic space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
        <label className="text-xs font-bold font-stamp uppercase tracking-widest text-[#F4C430] flex items-center gap-2">
          <Users className="w-4 h-4 text-[#E8146B]" />
          <span>SQUADRON FLIGHT ROSTER (2-3 MEMBERS)</span>
        </label>
        <button
          type="button"
          onClick={addSquadMember}
          disabled={squadMembers.length >= 3}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4C430] text-[#111111] font-bold text-xs border border-[#111111] shadow-comic hover:bg-[#ffd768] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Teammate</span>
        </button>
      </div>

      {/* Member Tab Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {squadMembers.map((member, idx) => {
          const isActive = idx === activeSquadMemberIndex;
          return (
            <div
              key={member.id}
              onClick={() => setActiveSquadMemberIndex(idx)}
              className={`relative p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                isActive
                  ? 'bg-[#F5EFE0] text-[#111111] border-[#111111] shadow-comic -translate-y-0.5'
                  : 'bg-[#0B3B2E] text-[#E4D8BE] border-[#111111] hover:bg-[#0e4838]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#07241C] border border-[#111111] flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {member.imageSrc ? (
                    <img src={member.imageSrc} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="truncate flex-1">
                  <div className="font-display text-xs truncate">
                    {member.name || `Member ${idx + 1}`}
                  </div>
                  <div className="text-[10px] font-bold text-gray-500 truncate">
                    {member.role || 'Role'}
                  </div>
                </div>

                {squadMembers.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSquadMember(idx);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Remove member"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Member Configuration */}
      <div className="p-4 rounded-xl bg-[#0B3B2E] border-2 border-[#111111] space-y-3 shadow-comic">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-stamp text-[#F4C430]">
            EDITING: {currentMember?.name || `MEMBER ${activeSquadMemberIndex + 1}`}
          </span>
          {currentMember?.imageSrc && (
            <span className="flex items-center gap-1 text-[11px] text-[#00E599] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Photo Ready
            </span>
          )}
        </div>

        {/* Name & Role Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold font-stamp text-[#E4D8BE] uppercase mb-1">
              Teammate Name
            </label>
            <input
              type="text"
              value={currentMember?.name || ''}
              onChange={(e) =>
                setSquadMemberInfo(activeSquadMemberIndex, e.target.value, currentMember?.role || '')
              }
              placeholder="e.g. Maya Chen"
              className="w-full px-3 py-2 rounded-xl bg-[#07241C] border border-[#111111] text-[#F5EFE0] font-bold text-xs focus:border-[#F4C430] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold font-stamp text-[#E4D8BE] uppercase mb-1">
              Role / Specialty
            </label>
            <input
              type="text"
              value={currentMember?.role || ''}
              onChange={(e) =>
                setSquadMemberInfo(activeSquadMemberIndex, currentMember?.name || '', e.target.value)
              }
              placeholder="e.g. Systems & Kernel"
              className="w-full px-3 py-2 rounded-xl bg-[#07241C] border border-[#111111] text-[#F5EFE0] font-bold text-xs focus:border-[#F4C430] focus:outline-none"
            />
          </div>
        </div>

        {/* Teammate Photo Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handleMemberPhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#E8146B] text-white font-bold text-xs border-2 border-[#111111] shadow-comic hover:bg-[#ff2480] transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>
              {currentMember?.imageSrc ? 'REPLACE THIS MEMBER PHOTO' : 'UPLOAD THIS MEMBER PHOTO'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
