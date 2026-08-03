import React, { useRef, useState, useEffect } from 'react';
import { Edit3, Upload, Trash2, CheckCircle } from 'lucide-react';

export const SignaturePad = ({ onSignatureChange, label = "Signature", required = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState('draw'); // 'draw' | 'upload'
  const [hasSignature, setHasSignature] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#6366f1';
    }
  }, [mode]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      onSignatureChange(dataUrl, null);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      onSignatureChange(null, null);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setHasSignature(true);
      onSignatureChange(null, file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-200 flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        
        <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-lg border border-gray-700 text-xs">
          <button
            type="button"
            onClick={() => { setMode('draw'); clearCanvas(); }}
            className={`px-2.5 py-1 rounded-md transition ${mode === 'draw' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
          >
            <Edit3 size={12} className="inline mr-1" /> Draw
          </button>
          <button
            type="button"
            onClick={() => { setMode('upload'); clearCanvas(); }}
            className={`px-2.5 py-1 rounded-md transition ${mode === 'upload' ? 'bg-indigo-600 text-white font-medium' : 'text-gray-400 hover:text-white'}`}
          >
            <Upload size={12} className="inline mr-1" /> Upload Image
          </button>
        </div>
      </div>

      {mode === 'draw' ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-slate-900/90 shadow-inner">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full cursor-crosshair touch-none"
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-2">
            {hasSignature && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded">
                <CheckCircle size={12} /> Signed
              </span>
            )}
            <button
              type="button"
              onClick={clearCanvas}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs flex items-center gap-1 border border-gray-600"
              title="Clear Signature"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-900/60 transition cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <Upload size={24} className="mx-auto text-indigo-400 mb-2" />
          <p className="text-sm font-medium text-gray-300">
            {fileName ? fileName : "Click or drag & drop signature image (PNG, JPG, SVG)"}
          </p>
          {fileName && (
            <p className="text-xs text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <CheckCircle size={12} /> Image Selected
            </p>
          )}
        </div>
      )}
    </div>
  );
};
