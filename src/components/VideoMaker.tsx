import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Loader2, Play, Download, Share2, Sparkles, Video as VideoIcon, Lock } from 'lucide-react';
import { generateVideo } from '../services/ai';
import { cn } from '../lib/utils';
import { UserProfile, saveProject } from '../services/firebase';

interface VideoMakerProps {
  profile: UserProfile | null;
}

export default function VideoMaker({ profile }: VideoMakerProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const statusMessages = [
    "Analyzing your creative prompt...",
    "Dreaming up the visual scenes...",
    "Simulating physics and motion...",
    "Rendering cinematic lighting...",
    "Polishing the final masterpiece...",
    "Almost there! Just a few more seconds..."
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % statusMessages.length);
      }, 8000);
    } else {
      setStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!profile) {
      setError("Please sign in to generate videos.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateVideo(
        prompt, 
        aspectRatio, 
        profile?.uid, 
        profile?.tier !== 'free'
      );
      if (url) {
        setVideoUrl(url);
        
        // Save to projects if user is logged in
        if (profile) {
          await saveProject(profile.uid, {
            title: prompt.slice(0, 30) + (prompt.length > 30 ? '...' : ''),
            type: 'video-maker',
            videoUrl: url
          });
        }
      }
    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `vivid-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left: Controls */}
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2 text-brand-primary">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Video Maker</h3>
          </div>
          <p className="text-white/60 text-sm">Describe the video you want to create. AI will generate scenes, motion, and details.</p>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A futuristic cyberpunk city with neon lights and flying cars, cinematic lighting, 4k..."
              className="w-full h-40 bg-bg-dark border border-border-dark rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Aspect Ratio</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                    aspectRatio === '16:9' ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "border-border-dark text-white/40 hover:border-white/20"
                  )}
                >
                  16:9 (Landscape)
                </button>
                <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                    aspectRatio === '9:16' ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "border-border-dark text-white/40 hover:border-white/20"
                  )}
                >
                  9:16 (Portrait)
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !profile}
            className="w-full py-4 bg-brand-primary text-bg-dark font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Video...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <VideoIcon className="w-5 h-5" />
                Generate Video
              </>
            )}
          </button>
        </div>

        <div className="glass-panel p-6">
          <h4 className="font-bold mb-4">Pro Tips</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
              Be specific about lighting (e.g. "golden hour", "cinematic", "neon").
            </li>
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
              Mention camera movements like "slow zoom", "drone shot", or "panning".
            </li>
            <li className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
              Describe the mood: "melancholic", "energetic", "peaceful".
            </li>
          </ul>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Preview</span>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                <Share2 className="w-4 h-4" />
              </button>
              {videoUrl && (
                <button 
                  onClick={handleDownload}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-brand-primary"
                  title="Download Video"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex-1 bg-black flex items-center justify-center relative group">
            {videoUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video 
                  src={videoUrl} 
                  controls 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : isGenerating ? (
              <div className="text-center space-y-6 px-8">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin mx-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-brand-primary animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-brand-primary font-display font-bold text-lg animate-pulse">
                    {statusMessages[statusIndex]}
                  </p>
                  <p className="text-white/40 text-xs">This usually takes 1-2 minutes. Please don't close this tab.</p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <VideoIcon className="w-16 h-16 mx-auto" />
                <p>Your video will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold">Generation History</h4>
            <button className="text-xs text-brand-primary hover:underline">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-32 h-20 bg-white/5 rounded-lg shrink-0 border border-border-dark hover:border-brand-primary/50 cursor-pointer transition-colors flex items-center justify-center">
                <Play className="w-6 h-6 text-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
