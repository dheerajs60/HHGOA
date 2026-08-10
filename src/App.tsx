import { useState } from 'react';
import { Header } from './components/Header';
import { FormatToggle } from './components/FormatToggle';
import { UploadZone } from './components/UploadZone';
import { CropStage } from './components/CropStage';
import { BuilderIdForm } from './components/BuilderIdForm';
import { SquadFrameBuilder } from './components/SquadFrameBuilder';
import { BeachBagDisplay } from './components/BeachBagDisplay';
import { CardPreview } from './components/CardPreview';
import { ResultScreen } from './components/ResultScreen';
import { useGeneratorStore } from './store/useGeneratorStore';
import { Sparkles, Terminal, Waves } from 'lucide-react';

export function App() {
  const { format, imageSrc } = useGeneratorStore();
  const [showResultModal, setShowResultModal] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <div className="min-h-screen bg-[#07241C] text-[#F5EFE0] flex flex-col justify-between selection:bg-[#E8146B] selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 sm:py-8">
        
        {/* Hero Section & Pitch */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8146B] text-white font-bold text-xs border-2 border-[#111111] shadow-comic font-stamp mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#F4C430]" />
            <span>CLAIM YOUR OFFICIAL BUILDER CREDENTIALS</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl text-[#F4C430] tracking-wide leading-none text-shadow-comic mb-2">
            BOARDING PASS TO PARADISE
          </h1>
          <p className="text-sm sm:text-base font-semibold text-[#E4D8BE] max-w-xl mx-auto">
            Turn your photo into an official Hacker House Goa 2026 Boarding Pass, Passport Stamp PFP, or Squad Frame. Deterministic seats, builder classes & instant export.
          </p>
        </div>

        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-4xl mx-auto px-4">
            <h2 className="font-display text-5xl sm:text-7xl text-[#F4C430] tracking-wide leading-none text-shadow-comic mb-6">
              READY TO BUILD IN GOA?
            </h2>
            <p className="text-lg sm:text-xl font-semibold text-[#E4D8BE] max-w-2xl mx-auto mb-10">
              Join the elite hacker squadron at Hacker House Goa 2026. Generate your deterministic builder class, boarding pass, and squad frame right now.
            </p>
            <button
              type="button"
              onClick={() => setHasStarted(true)}
              className="flex items-center justify-center gap-3 py-5 px-10 rounded-2xl bg-[#E8146B] text-white font-display text-3xl tracking-wider border-4 border-[#111111] shadow-comic-xl hover:bg-[#ff2581] active:translate-x-1 active:translate-y-1 transition-all cursor-pointer hover:-rotate-1"
            >
              <Sparkles className="w-8 h-8 text-[#F4C430]" />
              <span>CREATE BOARDING PASS</span>
            </button>
          </div>
        ) : (
          <>
            {/* Format Selector Bar */}
            <div className="max-w-3xl mx-auto mb-6">
              <FormatToggle />
            </div>

            {/* 2-Column Responsive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Airport Check-in Controls & Forms (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Upload Dropzone / Camera */}
                <div className="p-4 rounded-3xl bg-[#0B3B2E] border-3 border-[#111111] shadow-comic">
                  {format === 'squad' ? (
                    <SquadFrameBuilder />
                  ) : (
                    <div className="space-y-4">
                      <UploadZone />
                      {imageSrc && <CropStage />}
                    </div>
                  )}
                </div>

                {/* 2. Builder Manifest Form (Only in Boarding Pass / PFP mode) */}
                {format !== 'squad' && (
                  <div className="p-4 rounded-3xl bg-[#0B3B2E] border-3 border-[#111111] shadow-comic">
                    <BuilderIdForm />
                  </div>
                )}

              </div>

              {/* Right Column: Live Composite Retina Preview & Actions (5 cols, sticky on desktop) */}
              <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
                <div className="p-5 rounded-3xl bg-[#0B3B2E] border-3 border-[#111111] shadow-comic">
                  <CardPreview onOpenResultModal={() => setShowResultModal(true)} />
                </div>

                {/* Micro-Instructions for X Post */}
                <div className="p-4 rounded-2xl bg-[#07241C] border-2 border-[#111111] text-xs font-mono-code text-[#E4D8BE] shadow-comic">
                  <div className="text-[#F4C430] font-bold font-stamp text-sm mb-1 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-[#E8146B]" />
                    SUBMISSION INSTRUCTIONS:
                  </div>
                  <ul className="space-y-1 list-disc list-inside text-gray-300">
                    <li>Share your boarding pass with <span className="text-[#E8146B] font-bold">#FrameInGoa</span></li>
                    <li>Tag your squad teammates in the post</li>
                    <li>Each card includes an invite QR code back to the generator</li>
                  </ul>
                </div>

                {/* 3. Beach Bag Perks Showcase (Moved below preview for better mobile UX) */}
                {format !== 'squad' && <BeachBagDisplay />}
              </div>

            </div>
          </>
        )}
      </main>

      {/* Result Modal */}
      <ResultScreen isOpen={showResultModal} onClose={() => setShowResultModal(false)} />

      {/* Footer */}
      <footer className="border-t-4 border-[#111111] bg-[#0B3B2E] text-[#F5EFE0] px-4 py-6 mt-12 shadow-comic">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-display text-xl text-[#F4C430] text-shadow-comic">
              HACKER HOUSE GOA 2026
            </div>
            <p className="text-xs text-[#E4D8BE] mt-0.5">
              Less noise. More signal. Build → Ship → Repeat.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold font-stamp">
            <span className="text-[#F4C430] flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-[#E8146B]" /> PALOLEM & ARAMBOL
            </span>
            <span className="text-gray-400">●</span>
            <span className="text-[#00E599]">OCTOBER 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
