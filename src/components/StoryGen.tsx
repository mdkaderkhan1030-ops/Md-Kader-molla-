import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Loader2, Play, Wand2, Plus, RefreshCw, Lock, Download, Video as VideoIcon } from 'lucide-react';
import { generateVideo, generateStory } from '../services/ai';
import { cn } from '../lib/utils';
import { UserProfile } from '../services/firebase';

interface StoryGenProps {
  profile: UserProfile | null;
}

export default function StoryGen({ profile }: StoryGenProps) {
  const [story, setStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [style, setStyle] = useState('3D Animation (Pixar Style)');
  const [mood, setMood] = useState('Whimsical');
  const [error, setError] = useState<string | null>(null);

  const handleMagicWrite = async () => {
    if (!story.trim()) return;
    setIsWriting(true);
    try {
      const newStory = await generateStory(story);
      setStory(newStory);
    } catch (error) {
      console.error(error);
    } finally {
      setIsWriting(false);
    }
  };

  const handleGenerate = async () => {
    if (!story.trim()) return;
    if (!profile) {
      setError("Please sign in to generate videos.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const enhancedPrompt = `Cinematic ${style} video. Mood: ${mood}. Story: ${story}. High quality, detailed animation, masterpiece.`;
      const url = await generateVideo(
        enhancedPrompt, 
        '16:9', 
        profile.uid, 
        profile.tier !== 'free'
      );
      if (url) setVideoUrl(url);
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
    link.download = `story-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-purple-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Story Video Generator</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Your Story</label>
              <button 
                onClick={handleMagicWrite}
                disabled={isWriting || !story.trim()}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
              >
                {isWriting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                Magic Write
              </button>
            </div>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Once upon a time in a digital forest, a small robot found a glowing seed..."
              className="w-full h-60 bg-bg-dark border border-border-dark rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-400 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Animation Style</label>
              <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-bg-dark border border-border-dark rounded-xl p-3 text-sm focus:outline-none focus:border-purple-400"
              >
                <option>3D Animation (Pixar Style)</option>
                <option>Anime / Manga</option>
                <option>Cinematic Realistic</option>
                <option>Watercolor Illustration</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Mood</label>
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-bg-dark border border-border-dark rounded-xl p-3 text-sm focus:outline-none focus:border-purple-400"
              >
                <option>Whimsical</option>
                <option>Dramatic</option>
                <option>Epic</option>
                <option>Dark / Moody</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !story.trim() || !profile}
            className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Animation...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Story Video
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Story Preview</span>
            {videoUrl && (
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-purple-400"
                title="Download Story Video"
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
                <div className="w-16 h-16 border-4 border-purple-400/20 border-t-purple-400 rounded-full animate-spin mx-auto" />
                <p className="text-purple-400 font-medium animate-pulse">Bringing your story to life...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <BookOpen className="w-16 h-16 mx-auto" />
                <p>Your story animation will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
