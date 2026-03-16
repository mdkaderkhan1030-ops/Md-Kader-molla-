import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Wand2, Loader2, Copy, Check, Lock, Sparkles } from 'lucide-react';
import { getAI } from '../services/ai';
import { UserProfile } from '../services/firebase';
import { cn } from '../lib/utils';

interface ScriptGenProps {
  profile: UserProfile | null;
}

export default function ScriptGen({ profile }: ScriptGenProps) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState('YouTube');
  const [copied, setCopied] = useState(false);

  const platforms = ['YouTube', 'TikTok', 'Facebook', 'Instagram Reels'];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (!profile) {
      setError("Please sign in to generate scripts.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const ai = getAI();
      if (!ai) throw new Error("AI Service unavailable");
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write a viral video script for ${platform} about: ${topic}. Include a hook, main content points, and a call to action. Format it professionally with scene descriptions and dialogue.`,
      });
      
      if (response.text) setScript(response.text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (script) {
      navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <FileText className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">AI Script Generator</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Video Topic</label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to make a video about?"
              className="w-full h-32 bg-white/5 border border-border-dark rounded-xl p-4 text-sm focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40">Target Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                    platform === p 
                      ? "bg-cyan-400/10 border-cyan-400 text-cyan-400" 
                      : "bg-white/5 border-border-dark text-white/40 hover:border-cyan-400/30"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim() || !profile}
            className="w-full py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Writing Script...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Script
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Script Preview</span>
            {script && (
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Script'}
              </button>
            )}
          </div>
          
          <div className="flex-1 bg-black/20 overflow-y-auto p-6 custom-scrollbar">
            {script ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-sans leading-relaxed text-white/80">
                  {script}
                </div>
              </div>
            ) : isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="flex gap-2">
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                  <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-cyan-400 rounded-full" />
                </div>
                <p className="text-cyan-400 font-medium animate-pulse">AI is crafting your viral script...</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <FileText className="w-16 h-16 mx-auto" />
                <p>Your AI-generated script will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
