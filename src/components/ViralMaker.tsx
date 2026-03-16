import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Music, Wand2, Loader2, Sparkles, TrendingUp, Scissors, Lock, Download, Video as VideoIcon, RefreshCw } from 'lucide-react';
import { generateViralVideo, getTrendingTopics } from '../services/ai';
import { cn } from '../lib/utils';
import { UserProfile, saveProject } from '../services/firebase';

interface ViralMakerProps {
  profile: UserProfile | null;
}

export default function ViralMaker({ profile }: ViralMakerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState('TikTok');
  const [style, setStyle] = useState('Trending Style');
  const [error, setError] = useState<string | null>(null);
  const [trends, setTrends] = useState<string[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setIsLoadingTrends(true);
    try {
      const newTrends = await getTrendingTopics();
      setTrends(newTrends);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handleGenerate = async () => {
    if (!profile) {
      setError("Please sign in to generate videos.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateViralVideo(
        platform, 
        style, 
        profile?.uid, 
        profile?.tier !== 'free'
      );
      if (url) {
        setVideoUrl(url);
        
        // Save to projects if user is logged in
        if (profile) {
          await saveProject(profile.uid, {
            title: `${platform} Viral - ${style}`,
            type: 'viral-maker',
            videoUrl: url
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `viral-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-yellow-400">
            <Zap className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">One Click Viral Video Maker</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: 'Trending Style', icon: TrendingUp },
              { name: 'Auto Sync Music', icon: Music },
              { name: 'Smart Cuts', icon: Scissors },
              { name: 'Viral Effects', icon: Sparkles }
            ].map((item) => (
              <button 
                key={item.name}
                onClick={() => setStyle(item.name)}
                className={cn(
                  "p-4 rounded-xl border transition-all flex flex-col items-center gap-2 group",
                  style === item.name ? "bg-yellow-400/10 border-yellow-400 text-yellow-400" : "border-border-dark bg-white/5 hover:border-yellow-400/50"
                )}
              >
                <item.icon className={cn("w-6 h-6 group-hover:scale-110 transition-transform", style === item.name ? "text-yellow-400" : "text-white/40")} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Select Platform</label>
            <div className="flex gap-2">
              {['TikTok', 'Reels', 'Shorts'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-xs font-medium transition-all",
                    platform === p ? "bg-yellow-400/10 border-yellow-400 text-yellow-400" : "border-border-dark text-white/40 hover:border-yellow-400/50"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !profile}
            className="w-full py-4 bg-yellow-500 text-bg-dark font-bold rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Making it Viral...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Viral Video
              </>
            )}
          </button>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold">Trending Now</h4>
            <button 
              onClick={fetchTrends}
              disabled={isLoadingTrends}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-yellow-400 disabled:opacity-50"
              title="Refresh Trends"
            >
              <RefreshCw className={cn("w-4 h-4", isLoadingTrends && "animate-spin")} />
            </button>
          </div>
          <div className="space-y-3">
            {isLoadingTrends ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-white/5 rounded-lg border border-border-dark animate-pulse" />
              ))
            ) : (
              trends.map((trend, i) => (
                <button 
                  key={i} 
                  onClick={() => setStyle(trend)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all group",
                    style === trend 
                      ? "bg-yellow-400/10 border-yellow-400 text-yellow-400" 
                      : "bg-white/5 border-border-dark hover:border-yellow-400/30"
                  )}
                >
                  <span className="text-sm">{trend}</span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider transition-colors",
                    style === trend ? "bg-yellow-400 text-bg-dark" : "text-yellow-400 bg-yellow-400/10"
                  )}>HOT</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Viral Preview</span>
            {videoUrl && (
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-yellow-400"
                title="Download Viral Video"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {videoUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video src={videoUrl} controls className="max-w-full max-h-full object-contain" />
              </div>
            ) : isGenerating ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto" />
                <p className="text-yellow-400 font-medium animate-pulse">Applying viral magic...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <Zap className="w-16 h-16 mx-auto" />
                <p>Your viral video will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
