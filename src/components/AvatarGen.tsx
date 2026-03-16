import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserCircle, Mic, Video, Loader2, Sparkles, Upload, Volume2, Lock, Download, Video as VideoIcon } from 'lucide-react';
import { generateVideo, generateSpeech } from '../services/ai';
import { cn } from '../lib/utils';
import { UserProfile } from '../services/firebase';

interface AvatarGenProps {
  profile: UserProfile | null;
}

export default function AvatarGen({ profile }: AvatarGenProps) {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [voice, setVoice] = useState<'Zephyr' | 'Kore' | 'Fenrir'>('Zephyr');
  const [error, setError] = useState<string | null>(null);

  const avatars = [
    { name: 'Alex', img: 'https://picsum.photos/seed/alex/200', gender: 'male' },
    { name: 'Sarah', img: 'https://picsum.photos/seed/sarah/200', gender: 'female' },
    { name: 'John', img: 'https://picsum.photos/seed/john/200', gender: 'male' },
    { name: 'Elena', img: 'https://picsum.photos/seed/elena/200', gender: 'female' },
  ];

  const handleGenerateAudio = async () => {
    if (!script.trim()) return;
    setIsGeneratingAudio(true);
    try {
      const url = await generateSpeech(script, voice);
      if (url) setAudioUrl(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) return;
    if (!profile) {
      setError("Please sign in to generate videos.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const prompt = `A professional cinematic video of a ${avatars[selectedAvatar].gender} presenter named ${avatars[selectedAvatar].name} talking directly to the camera. Studio lighting, high quality, realistic facial expressions, 4k.`;
      const url = await generateVideo(
        prompt, 
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
    link.download = `avatar-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-orange-400">
            <UserCircle className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Avatar Video Creator</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Select Avatar</label>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAvatar(i)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                    selectedAvatar === i ? "border-orange-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <img src={avatar.img} alt={avatar.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-center">
                    {avatar.name}
                  </div>
                </button>
              ))}
              <button className="aspect-square rounded-xl border-2 border-dashed border-border-dark flex flex-col items-center justify-center gap-1 text-white/20 hover:text-white/40 hover:border-white/20 transition-all">
                <Upload className="w-4 h-4" />
                <span className="text-[10px]">Custom</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Script</label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Hello! I am your AI presenter. I can talk about your business or products..."
              className="w-full h-40 bg-bg-dark border border-border-dark rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-orange-400 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Voice</label>
              <select 
                value={voice}
                onChange={(e) => setVoice(e.target.value as any)}
                className="w-full bg-bg-dark border border-border-dark rounded-xl p-3 text-sm focus:outline-none focus:border-orange-400"
              >
                <option value="Zephyr">Zephyr (Professional)</option>
                <option value="Kore">Kore (Friendly)</option>
                <option value="Fenrir">Fenrir (Deep)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Preview Voice</label>
              <button 
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio || !script.trim()}
                className="w-full h-[46px] bg-white/5 border border-border-dark rounded-xl flex items-center justify-center gap-2 text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {isGeneratingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                {audioUrl ? 'Regenerate Audio' : 'Generate Audio'}
              </button>
            </div>
          </div>

          {audioUrl && (
            <div className="p-3 bg-orange-400/10 border border-orange-400/20 rounded-xl flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-orange-400" />
              <audio src={audioUrl} controls className="h-8 flex-1" />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !script.trim() || !profile}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Avatar...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <VideoIcon className="w-5 h-5" />
                Generate Avatar Video
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Avatar Preview</span>
            {videoUrl && (
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-orange-400"
                title="Download Avatar Video"
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
                <div className="w-16 h-16 border-4 border-orange-400/20 border-t-orange-400 rounded-full animate-spin mx-auto" />
                <p className="text-orange-400 font-medium animate-pulse">Synthesizing your AI presenter...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <UserCircle className="w-16 h-16 mx-auto" />
                <p>Your avatar video will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
