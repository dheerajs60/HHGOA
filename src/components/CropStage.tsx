import React from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, RotateCw, RefreshCcw } from 'lucide-react';
import { useGeneratorStore } from '../store/useGeneratorStore';

export const CropStage: React.FC = () => {
  const { imageSrc, crop, setCrop, zoom, setZoom, rotation, setRotation, format } = useGeneratorStore();

  if (!imageSrc) return null;

  // Aspect ratio depends on format: PFP is 1:1, Boarding Pass photo well is ~ 3:4 (0.8)
  const aspect = format === 'pfp' ? 1 : 0.8;

  const onCropChange = (location: { x: number; y: number }) => {
    setCrop(location);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const rotate90 = () => {
    setRotation((rotation + 90) % 360);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="w-full bg-[#07241C] border-3 border-[#111111] rounded-2xl p-4 shadow-comic space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold font-stamp uppercase tracking-widest text-[#F4C430] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00E599]" />
          PHOTO POSITION & ZOOM
        </label>
        <span className="text-[11px] font-mono-code text-[#E4D8BE]">DRAG TO PAN · WHEEL TO ZOOM</span>
      </div>

      {/* Cropper Viewport Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden bg-[#051A14] border-2 border-[#111111]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          cropShape={format === 'pfp' ? 'round' : 'rect'}
          showGrid={true}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          style={{
            containerStyle: { background: '#051A14' },
            cropAreaStyle: {
              border: '3px solid #F4C430',
              boxShadow: '0 0 0 9999em rgba(7, 36, 28, 0.85)',
            },
          }}
        />
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Zoom Control */}
        <div className="flex items-center gap-2 bg-[#0B3B2E] p-2 rounded-xl border border-[#111111]">
          <ZoomIn className="w-4 h-4 text-[#F4C430] flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full accent-[#E8146B] h-2 bg-[#07241C] rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono-code font-bold text-[#F5EFE0] min-w-[3rem] text-right">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Rotate & Reset Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={rotate90}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0B3B2E] text-[#F5EFE0] border border-[#111111] text-xs font-bold font-stamp hover:bg-[#F4C430] hover:text-[#111111] transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>ROTATE 90°</span>
          </button>
          <button
            type="button"
            onClick={resetCrop}
            className="flex items-center justify-center p-2 rounded-xl bg-[#0B3B2E] text-[#E4D8BE] border border-[#111111] text-xs font-bold hover:bg-[#E8146B] hover:text-white transition-colors"
            title="Reset position"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
