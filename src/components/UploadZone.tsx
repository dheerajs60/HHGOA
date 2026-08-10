import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { convertHeicIfNeeded } from '../lib/heicConvert';

// Sample demo avatars so users can preview immediately
const DEMO_AVATARS = [
  {
    name: 'Beach Hacker',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dev Nomad',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ship Sorcerer',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Async Lead',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
  },
];

export const UploadZone: React.FC = () => {
  const { imageSrc, setImageSrc, setCrop, setZoom, setRotation } = useGeneratorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const dataUrl = await convertHeicIfNeeded(file);
      setImageSrc(dataUrl);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } catch (e) {
      console.error('Error reading image file:', e);
      alert('Unable to load this image. Please try a JPG or PNG.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const selectDemoAvatar = (url: string) => {
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold font-stamp uppercase tracking-widest text-[#F4C430] flex items-center gap-1.5">
          <span>AIRPORT PHOTO CHECK-IN</span>
          {imageSrc && <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599]" />}
        </label>
        <span className="text-[11px] font-mono-code text-[#E4D8BE]">JPG · PNG · HEIC · WEBP</span>
      </div>

      {/* Main Drag-and-Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-3 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#F4C430] bg-[#0e4838] scale-[1.01]'
            : imageSrc
            ? 'border-[#00E599] bg-[#07241C]/80'
            : 'border-[#E4D8BE]/40 bg-[#07241C] hover:border-[#F4C430] hover:bg-[#093025]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />

        <div className="flex flex-col items-center gap-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#0B3B2E] border-2 border-[#111111] shadow-comic flex items-center justify-center text-[#F4C430]">
            {isProcessing ? (
              <RefreshCw className="w-7 h-7 animate-spin text-[#E8146B]" />
            ) : imageSrc ? (
              <CheckCircle2 className="w-7 h-7 text-[#00E599]" />
            ) : (
              <ImageIcon className="w-7 h-7" />
            )}
          </div>

          <div>
            <div className="font-display text-lg tracking-wide text-[#F5EFE0]">
              {isProcessing
                ? 'CONVERTING HEIC / SCANNING...'
                : imageSrc
                ? 'PHOTO ATTACHED · CLICK TO REPLACE'
                : 'DROP YOUR PHOTO HERE'}
            </div>
            <p className="text-xs text-[#E4D8BE]/80 mt-0.5">
              Drag and drop, browse files, or snap a beach selfie
            </p>
          </div>

          <div className="flex items-center justify-center mt-1">
            <span className="px-5 py-2 rounded-xl bg-[#E8146B] text-white font-bold text-sm tracking-wide border-2 border-[#111111] shadow-comic hover:bg-[#ff2581]">
              Browse Files
            </span>
          </div>
        </div>
      </div>

      {/* Demo Starters for Instant 1-Click Try */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold font-stamp text-[#E4D8BE] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#F4C430]" /> OR TRY WITH SAMPLE HACKERS:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DEMO_AVATARS.map((demo) => (
            <button
              key={demo.name}
              type="button"
              onClick={() => selectDemoAvatar(demo.url)}
              className="group relative flex flex-col items-center p-1 rounded-xl bg-[#07241C] border border-[#111111] hover:border-[#F4C430] transition-all overflow-hidden"
            >
              <img
                src={demo.url}
                alt={demo.name}
                className="w-11 h-11 rounded-lg object-cover border border-[#111111] group-hover:scale-105 transition-transform"
              />
              <span className="text-[10px] font-bold text-[#E4D8BE] mt-1 truncate w-full text-center">
                {demo.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
