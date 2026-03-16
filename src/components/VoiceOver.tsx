import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, Play, Loader2, Download, Volume2, Lock, Sparkles } from 'lucide-react';
import { generateSpeech } from '../services/ai';
import { UserProfile } from '../services/firebase';
import { cn } from '../lib/utils';

interface VoiceOverProps {
  profile: UserProfile | null;
}

export default function VoiceOver({ profile }: VoiceOverProps) {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voice, setVoice] = useState<'Zephyr' | 'Kore' | 'Fenrir'>('Zephyr');

  const voices = [
    { id: 'Zephyr', name: 'Zephyr (Calm)', desc: 'Perfect for documentaries' },
    { id: 'Kore', name: 'Kore (Energetic)', desc: 'Great for ads and promos' },
    { id: 'Fenrir', name: 'Fenrir (Deep)', desc: 'Ideal for narrations' },
  ];

  const handleGenerate = async () => {
    if (!text.trim()) return;
    if (!profile) {
      setError("Please sign in to generate voice overs.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateSpeech(text, voice);
      if (url) setAudioUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `voiceover-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Mic className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Voice Over</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Script to Narrate</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the text you want the AI to speak..."
              className="w-full h-48 bg-white/5 border border-border-dark rounded-xl p-4 text-sm focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-400/50 outline-none transition-all resize-none"
            />
            <div className="flex justify-end">
              <span className="text-[10px] text-white/20 font-mono">{text.length} / 5000 characters</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Select Voice</label>
            <div className="grid grid-cols-1 gap-2">
              {voices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVoice(v.id as any)}
                  className={cn(
                    "p-3 rounded-xl border transition-all flex items-center justify-between group",
                    voice === v.id 
                      ? "bg-indigo-400/10 border-indigo-400 text-indigo-400" 
                      : "bg-white/5 border-border-dark text-white/40 hover:border-indigo-400/30"
                  )}
                >
                  <div className="text-left">
                    <p className="text-sm font-bold">{v.name}</p>
                    <p className="text-[10px] opacity-60">{v.desc}</p>
                  </div>
                  <Volume2 className={cn("w-4 h-4 transition-transform group-hover:scale-110", voice === v.id ? "text-indigo-400" : "text-white/20")} />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim() || !profile}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Voice...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Generate Voice Over
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Audio Preview</span>
            {audioUrl && (
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/60 hover:text-indigo-400"
                title="Download Audio"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-black/40 flex items-center justify-center relative p-8">
            {audioUrl ? (
              <div className="w-full max-w-md space-y-6">
                <div className="p-8 rounded-3xl bg-indigo-400/10 border border-indigo-400/20 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-400 rounded-full flex items-center justify-center shadow-lg shadow-indigo-400/20">
                    <Volume2 className="w-10 h-10 text-white" />
                  </div>
                  <audio src={audioUrl} controls className="w-full" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-indigo-400">Voice Generation Complete</p>
                  <p className="text-xs text-white/40 mt-1">Ready for your video project</p>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 40, 10] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1.5 bg-indigo-400 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-indigo-400 font-medium animate-pulse">Synthesizing professional voice...</p>
              </div>
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <Mic className="w-16 h-16 mx-auto" />
                <p>Your voice over will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
