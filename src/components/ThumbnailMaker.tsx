import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Wand2, Loader2, Download, Share2, Sparkles, Lock, Video as VideoIcon } from 'lucide-react';
import { generateImage } from '../services/ai';
import { UserProfile } from '../services/firebase';
import { cn } from '../lib/utils';

interface ThumbnailMakerProps {
  profile: UserProfile | null;
}

export default function ThumbnailMaker({ profile }: ThumbnailMakerProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState('Cinematic');

  const styles = ['Cinematic', 'Cartoon', '3D Render', 'Minimalist', 'Vibrant'];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!profile) {
      setError("Please sign in to generate thumbnails.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const finalPrompt = `YouTube thumbnail for: ${prompt}. Style: ${style}. High contrast, eye-catching, professional, 4k.`;
      const url = await generateImage(finalPrompt);
      if (url) setImageUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-pink-400">
            <ImageIcon className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Thumbnail Maker</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Video Topic / Title</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What is your video about? (e.g., 10 Life Hacks for Developers)"
              className="w-full h-32 bg-white/5 border border-border-dark rounded-xl p-4 text-sm focus:border-pink-400/50 focus:ring-1 focus:ring-pink-400/50 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Thumbnail Style</label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                    style === s 
                      ? "bg-pink-400/10 border-pink-400 text-pink-400" 
                      : "bg-white/5 border-border-dark text-white/40 hover:border-pink-400/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !profile}
            className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Thumbnail...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Thumbnail
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Thumbnail Preview</span>
            {imageUrl && (
              <div className="flex gap-2">
                <button 
                  onClick={handleDownload}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-pink-400"
                  title="Download Thumbnail"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 bg-black/40 flex items-center justify-center relative p-8">
            {imageUrl ? (
              <div className="relative group max-w-full">
                <img 
                  src={imageUrl} 
                  alt="Generated Thumbnail" 
                  className="rounded-lg shadow-2xl max-w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : isGenerating ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-pink-400/20 border-t-pink-400 rounded-full animate-spin mx-auto" />
                <p className="text-pink-400 font-medium animate-pulse">Designing your viral thumbnail...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <ImageIcon className="w-16 h-16 mx-auto" />
                <p>Your thumbnail will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
