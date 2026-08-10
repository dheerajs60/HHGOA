import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { convertHeicIfNeeded } from '../lib/heicConvert';



export const UploadZone: React.FC = () => {
  const { imageSrc, setImageSrc, setCrop, setZoom, setRotation } = useGeneratorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

          <div className="flex items-center justify-center gap-2 mt-1">
            {imageSrc && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImageSrc(null);
                }}
                className="px-4 py-2 rounded-xl bg-transparent text-[#E4D8BE] font-bold text-sm tracking-wide border-2 border-[#111111] hover:bg-[#111111] hover:text-[#F4C430]"
              >
                Remove
              </button>
            )}
            <span className="px-5 py-2 rounded-xl bg-[#E8146B] text-white font-bold text-sm tracking-wide border-2 border-[#111111] shadow-comic hover:bg-[#ff2581]">
              Browse Files
            </span>
          </div>
        </div>
      </div>


    </div>
  );
};
