import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Upload, Loader2, Download, Play, Lock, Sparkles, Music, Wand2, X } from 'lucide-react';
import { autoEditVideo } from '../services/ai';
import { UserProfile } from '../services/firebase';
import { cn } from '../lib/utils';

interface AutoEditorProps {
  profile: UserProfile | null;
}

export default function AutoEditor({ profile }: AutoEditorProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editStyle, setEditStyle] = useState('Dynamic');

  const styles = ['Dynamic', 'Cinematic', 'Minimal', 'Fast-paced', 'Vlog Style'];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedVideo(url);
      setResultVideo(null);
      setError(null);
    }
  };

  const handleAutoEdit = async () => {
    if (!selectedVideo) {
      setError("Please upload a video first.");
      return;
    }
    
    if (!profile) {
      setError("Please sign in to use this tool.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      const result = await autoEditVideo(
        selectedVideo, 
        editStyle, 
        profile?.uid, 
        profile?.tier === 'pro'
      );
      
      if (result) {
        setResultVideo(result);
      } else {
        throw new Error("Failed to edit video");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "AI Editing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultVideo) return;
    const link = document.createElement('a');
    link.href = resultVideo;
    link.download = `edited-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-lime-400">
            <Scissors className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Auto Editor</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div 
              className={cn(
                "relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all overflow-hidden",
                selectedVideo ? "border-lime-400/50 bg-lime-400/5" : "border-white/10 hover:border-white/20 bg-white/5"
              )}
            >
              {selectedVideo ? (
                <div className="relative w-full h-full group">
                  <video src={selectedVideo} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setSelectedVideo(null)}
                      className="p-2 bg-red-500 rounded-full text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-white/40" />
                  </div>
                  <p className="text-sm font-medium text-white/60">Upload video to auto-edit</p>
                  <p className="text-xs text-white/20 mt-1">MP4, MOV up to 100MB</p>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Editing Style</label>
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setEditStyle(s)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                      editStyle === s 
                        ? "bg-lime-400/10 border-lime-400 text-lime-400" 
                        : "bg-white/5 border-border-dark text-white/40 hover:border-lime-400/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-border-dark flex items-center gap-2">
                <Music className="w-4 h-4 text-lime-400" />
                <span className="text-xs text-white/60">AI Music Sync</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-border-dark flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-lime-400" />
                <span className="text-xs text-white/60">Smart Cuts</span>
              </div>
            </div>

            <button
              onClick={handleAutoEdit}
              disabled={isProcessing || !selectedVideo || !profile}
              className="w-full py-4 bg-lime-600 text-bg-dark font-bold rounded-xl hover:bg-lime-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  AI is Editing...
                </>
              ) : !profile ? (
                <>
                  <Lock className="w-5 h-5" />
                  Sign in to Use
                </>
              ) : (
                <>
                  <Scissors className="w-5 h-5" />
                  Auto Edit Video
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Edited Video Result</span>
            {resultVideo && (
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-lime-400"
                title="Download Video"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {resultVideo ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video src={resultVideo} controls className="max-w-full max-h-full object-contain" />
                {profile?.tier === 'free' && (
                  <div className="absolute bottom-12 right-4 pointer-events-none select-none opacity-50 flex flex-col items-end">
                    <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-lime-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white">VividAI Studio</span>
                    </div>
                  </div>
                )}
              </div>
            ) : isProcessing ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-lime-400/20 border-t-lime-400 rounded-full animate-spin mx-auto" />
                <p className="text-lime-400 font-medium animate-pulse">AI is applying smart transitions...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <Play className="w-16 h-16 mx-auto" />
                <p>Your edited video will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
