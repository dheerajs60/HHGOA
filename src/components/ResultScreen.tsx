import React, { useState, useEffect } from 'react';
import { Download, Share2, Copy, Check, X, Sparkles } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { shareBoardingPassToX, triggerDownload } from '../lib/shareToX';
import { uploadToImgBB } from '../lib/imgbb';
import { generateDeterministicProfile } from '../lib/seededGenerator';

interface ResultScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ isOpen, onClose }) => {
  const { generatedBlob, generatedDataUrl, profile, format } = useGeneratorStore();
  const [copied, setCopied] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const filename = `HH-Goa-2026-${(profile.name || 'Builder').replace(/\s+/g, '-')}-${format}.png`;

  if (!isOpen || !generatedDataUrl || !generatedBlob) return null;

  const meta = generateDeterministicProfile(profile.name, profile.role || 'Full Stack', profile.tagline);
  const builderClass = profile.customClass || meta.builderClass;

  const handleDownload = () => {
    triggerDownload(generatedBlob, filename);
  };

  const handleShareToX = async () => {
    const res = await shareBoardingPassToX({
      blob: generatedBlob,
      filename,
      name: profile.name,
      builderClass,
      format,
      gate: meta.gate,
      seat: meta.seat,
    });
    if (res.message) {
      setShareStatus(res.message);
      setTimeout(() => setShareStatus(null), 6000);
    }
  };

  const handleCopyImage = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': generatedBlob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (e) {
      console.warn('Copy to clipboard error:', e);
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051A14]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0B3B2E] border-4 border-[#111111] rounded-3xl p-4 sm:p-6 shadow-comic-xl my-4 sm:my-8">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full bg-[#E8146B] text-white border-2 border-[#111111] shadow-comic hover:bg-[#ff2581] transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8146B] text-white font-bold text-xs border border-[#111111] font-stamp mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" /> PASSPORT STAMP READY
          </div>
          <h2 className="font-display text-3xl sm:text-4xl text-[#F4C430] tracking-wider text-shadow-comic">
            BOARDING PASS TO PARADISE
          </h2>
          <p className="text-sm font-semibold text-[#E4D8BE]">
            Official HH Goa 2026 Asset Generated · Ready to Ship & Share
          </p>
        </div>

        {/* Generated Image Preview */}
        <div className="relative rounded-2xl overflow-hidden border-3 border-[#111111] bg-[#07241C] shadow-comic max-w-md mx-auto">
          <img
            src={generatedDataUrl}
            alt="Generated Boarding Pass"
            className="w-full h-auto block select-none"
          />
        </div>

        {/* Status Toast Alert */}
        {shareStatus && (
          <div className="mt-4 p-3 rounded-xl bg-[#F4C430] text-[#111111] border-2 border-[#111111] font-bold text-xs text-center shadow-comic">
            {shareStatus}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {/* Primary Share to X */}
          <button
            type="button"
            onClick={handleShareToX}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#E8146B] text-white font-display text-xl sm:text-2xl tracking-wider border-3 border-[#111111] shadow-comic-lg hover:bg-[#ff2581] active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5 text-[#F4C430]" />
            <span>SHARE TO X (#FrameInGoa)</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F4C430] text-[#111111] font-display text-base tracking-wide border-2 border-[#111111] shadow-comic hover:bg-[#ffd768] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0B3B2E]" />
              <span>DOWNLOAD PNG (1080P)</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              type="button"
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F5EFE0] text-[#111111] font-display text-base tracking-wide border-2 border-[#111111] shadow-comic hover:bg-[#ffffff] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#00E599]" />
                  <span>COPIED TO CLIPBOARD!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#E8146B]" />
                  <span>COPY IMAGE CLIPBOARD</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Microcopy footer */}
        <div className="mt-4 pt-3 border-t-2 border-[#111111] text-center text-xs font-mono-code text-[#E4D8BE]">
          <span className="text-[#F4C430]">#FrameInGoa</span> · BUILD → SHIP → REPEAT · HH GOA 2026
        </div>
      </div>
    </div>
  );
};
