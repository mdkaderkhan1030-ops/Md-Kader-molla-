import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eraser, Upload, Loader2, Download, Image as ImageIcon, Lock, Sparkles, X } from 'lucide-react';
import { removeBackground } from '../services/ai';
import { UserProfile } from '../services/firebase';
import { cn } from '../lib/utils';

interface BgRemoverProps {
  profile: UserProfile | null;
}

export default function BgRemover({ profile }: BgRemoverProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBg = async () => {
    if (!selectedImage) return;
    if (!profile) {
      setError("Please sign in to use this tool.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const result = await removeBackground(selectedImage);
      if (result) {
        setResultImage(result);
      } else {
        throw new Error("Failed to process image");
      }
    } catch (err: any) {
      console.error(err);
      setError("Background removal failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `bg-removed-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-rose-400">
            <Eraser className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Background Remover</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div 
              className={cn(
                "relative h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden",
                selectedImage ? "border-rose-400/50 bg-rose-400/5" : "border-white/10 hover:border-white/20 bg-white/5"
              )}
            >
              {selectedImage ? (
                <>
                  <img src={selectedImage} alt="Upload" className="w-full h-full object-contain p-4" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-white/40" />
                  </div>
                  <p className="text-sm font-medium text-white/60">Upload image to remove background</p>
                  <p className="text-xs text-white/20 mt-1">PNG, JPG up to 10MB</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>

            <button
              onClick={handleRemoveBg}
              disabled={isProcessing || !selectedImage || !profile}
              className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Removing Background...
                </>
              ) : !profile ? (
                <>
                  <Lock className="w-5 h-5" />
                  Sign in to Use
                </>
              ) : (
                <>
                  <Eraser className="w-5 h-5" />
                  Remove Background
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-border-dark">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">How it works</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-xs text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                Upload any photo with a clear subject
              </li>
              <li className="flex items-start gap-2 text-xs text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                AI detects the subject and removes the background
              </li>
              <li className="flex items-start gap-2 text-xs text-white/60">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                Download as a transparent PNG
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Result Preview</span>
            {resultImage && (
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-rose-400"
                title="Download Image"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')] bg-repeat flex items-center justify-center relative p-8">
            {resultImage ? (
              <div className="relative group max-w-full">
                <img 
                  src={resultImage} 
                  alt="Result" 
                  className="max-w-full h-auto drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-rose-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ) : isProcessing ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-rose-400/20 border-t-rose-400 rounded-full animate-spin mx-auto" />
                <p className="text-rose-400 font-medium animate-pulse">Isolating subject...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <ImageIcon className="w-16 h-16 mx-auto" />
                <p>Processed image will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
