import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Download, Share2, Scissors, RefreshCw, Zap } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { renderCardToCanvas, loadImage } from '../lib/canvasRenderer';
import { playStampSound, playTicketTearSound } from '../lib/soundFx';

interface CardPreviewProps {
  onOpenResultModal: () => void;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ onOpenResultModal }) => {
  const {
    format,
    profile,
    imageSrc,
    crop,
    zoom,
    rotation,
    squadMembers,
    isStampAnimating,
    setIsStampAnimating,
    soundEnabled,
    setGeneratedResult,
    isStubTorn,
    setIsStubTorn,
  } = useGeneratorStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Master rendering pipeline
  const performRender = async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);

    try {
      let mainImg: HTMLImageElement | null = null;
      if (imageSrc) {
        try {
          mainImg = await loadImage(imageSrc);
        } catch (e) {
          console.warn('Could not load main image:', e);
        }
      }

      const squadImgs: (HTMLImageElement | null)[] = [];
      if (format === 'squad') {
        for (const member of squadMembers) {
          if (member.imageSrc) {
            try {
              const sImg = await loadImage(member.imageSrc);
              squadImgs.push(sImg);
            } catch {
              squadImgs.push(null);
            }
          } else {
            squadImgs.push(null);
          }
        }
      }

      await renderCardToCanvas(canvasRef.current, {
        format,
        profile,
        imageElement: mainImg,
        crop,
        zoom,
        rotation,
        squadMembers,
        squadImageElements: squadImgs,
      });

      // Export Blob & DataURL to store for instant sharing / downloading
      canvasRef.current.toBlob((blob) => {
        if (blob && canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL('image/png');
          setGeneratedResult(blob, dataUrl);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      setIsRendering(false);
    }
  };

  // Re-render whenever relevant inputs change
  useEffect(() => {
    performRender();
  }, [format, profile, imageSrc, crop, zoom, rotation, squadMembers]);

  // Stamp Generation Action
  const handleStampAction = () => {
    if (soundEnabled) {
      playStampSound();
    }

    setIsStampAnimating(true);
    setIsShaking(true);

    // Trigger celebratory beach confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0B3B2E', '#F4C430', '#E8146B', '#F5EFE0', '#00E599'],
    });

    setTimeout(() => {
      setIsShaking(false);
    }, 400);

    setTimeout(() => {
      setIsStampAnimating(false);
      onOpenResultModal();
    }, 600);
  };

  // Tear-off stub action
  const handleTearStub = () => {
    if (soundEnabled) {
      playTicketTearSound();
    }
    setIsStubTorn(!isStubTorn);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Banner with live badge */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm text-[#F4C430] tracking-wider text-shadow-comic">
            LIVE RETINA COMPOSITE
          </span>
          {isRendering && (
            <span className="flex items-center gap-1 text-[11px] text-[#00E599] font-mono-code font-bold">
              <RefreshCw className="w-3 h-3 animate-spin" /> 2X RENDER
            </span>
          )}
        </div>
        <div className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#E8146B] text-white border border-[#111111] font-stamp">
          {format === 'pfp' ? '1080 × 1080 PX' : '1080 × 1350 PX'}
        </div>
      </div>

      {/* Canvas Frame Container with Comic Shadow & Shake */}
      <div
        className={`relative w-full max-w-[460px] mx-auto rounded-3xl overflow-hidden border-4 border-[#111111] bg-[#07241C] shadow-comic-xl transition-transform ${
          isShaking ? 'animate-card-shake' : ''
        }`}
      >
        {/* The Live Composite Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-auto block select-none"
          style={{ imageRendering: 'auto' }}
        />

        {/* Animated Rubber Stamp Overlay Slam */}
        {isStampAnimating && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="animate-stamp-slam border-8 border-[#E8146B] bg-[#E8146B]/15 text-[#E8146B] font-display text-4xl sm:text-5xl px-6 py-4 rounded-3xl tracking-widest text-shadow-pink uppercase transform -rotate-12 backdrop-blur-[2px] shadow-comic-pink">
              ★ ACCEPTED ★
              <div className="text-sm font-stamp text-white text-center mt-1">
                HH GOA · FLIGHT APPROVED
              </div>
            </div>
          </div>
        )}

        {/* Perforated Stub Tear Visual Indicator in Boarding Pass mode */}
        {format === 'boarding_pass' && (
          <div className="absolute bottom-3 right-3 z-10">
            <button
              type="button"
              onClick={handleTearStub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5EFE0] text-[#111111] text-xs font-bold font-stamp border-2 border-[#111111] shadow-comic hover:bg-[#F4C430] active:scale-95 transition-all"
              title="Tear off stub for mini bio crop"
            >
              <Scissors className="w-3.5 h-3.5 text-[#E8146B]" />
              <span>{isStubTorn ? 'ATTACH STUB' : 'TEAR OFF STUB'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="w-full max-w-[460px] mt-5 space-y-2.5">
        {/* Main "STAMP MY PASSPORT" button */}
        <button
          type="button"
          onClick={handleStampAction}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#E8146B] text-white font-display text-2xl tracking-wider border-4 border-[#111111] shadow-comic-lg hover:bg-[#ff2480] active:translate-x-1 active:translate-y-1 active:shadow-comic transition-all cursor-pointer"
        >
          <Sparkles className="w-6 h-6 text-[#F4C430] animate-spin" />
          <span>STAMP MY PASSPORT</span>
          <Zap className="w-5 h-5 text-[#F4C430]" />
        </button>

        {/* Secondary Direct Action Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenResultModal}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F4C430] text-[#111111] font-display text-base tracking-wide border-3 border-[#111111] shadow-comic hover:bg-[#ffd768] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0B3B2E]" />
            <span>BOARD THE FLIGHT</span>
          </button>

          <button
            type="button"
            onClick={onOpenResultModal}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#0B3B2E] text-[#F5EFE0] font-display text-base tracking-wide border-3 border-[#111111] shadow-comic hover:bg-[#0e4838] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-[#E8146B]" />
            <span>SHARE #FrameInGoa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
