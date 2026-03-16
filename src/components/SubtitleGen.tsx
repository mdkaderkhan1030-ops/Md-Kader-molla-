import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Type, Loader2, Languages, Sparkles, Download, Copy, Check, Lock, Video as VideoIcon, Smile, X } from 'lucide-react';
import { generateSubtitles } from '../services/ai';
import { cn } from '../lib/utils';
import { Subtitle } from '../types';
import { UserProfile, saveProject } from '../services/firebase';

interface SubtitleGenProps {
  profile: UserProfile | null;
}

export default function SubtitleGen({ profile }: SubtitleGenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEmojis, setUseEmojis] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setError("File size exceeds 100MB limit.");
        return;
      }
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!videoFile) {
      setError("Please upload a video first.");
      return;
    }
    if (!profile) {
      setError("Please sign in to generate subtitles.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const prompt = `Generate subtitles for a professional AI video. ${useEmojis ? 'Include relevant emojis in the text.' : ''}`;
      const subs = await generateSubtitles(prompt);
      setSubtitles(subs);

      // Save to projects if user is logged in
      if (profile) {
        await saveProject(profile.uid, {
          title: videoFile.name,
          type: 'subtitle-gen',
          subtitles: subs
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transcription failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    const text = subtitles.map(s => `${s.start}s - ${s.end}s: ${s.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (subtitles.length === 0) return;
    const text = subtitles.map(s => `${s.start}s - ${s.end}s: ${s.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subtitles-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 text-blue-400">
            <Type className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl">Auto Subtitle Generator</h3>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center space-y-4 transition-colors cursor-pointer group relative overflow-hidden",
              videoFile ? "border-blue-400 bg-blue-400/5" : "border-border-dark hover:border-blue-400/50"
            )}
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
            
            {videoUrl ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-400/10 rounded-full flex items-center justify-center mx-auto">
                  <VideoIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-blue-400 truncate max-w-[200px] mx-auto">{videoFile?.name}</p>
                  <p className="text-xs text-white/40">{(videoFile!.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setVideoFile(null);
                    setVideoUrl(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-400/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold">Upload Video</p>
                  <p className="text-sm text-white/40">Drag and drop or click to browse</p>
                </div>
                <p className="text-xs text-white/20">MP4, MOV, AVI (Max 100MB)</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Language</label>
              <select className="w-full bg-white/5 border border-border-dark rounded-xl p-3 text-sm focus:outline-none focus:border-blue-400">
                <option>English (US)</option>
                <option>Bengali</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white/40">Emoji Subtitles</label>
              <button 
                onClick={() => setUseEmojis(!useEmojis)}
                className={cn(
                  "w-full p-3 rounded-xl border flex items-center justify-center gap-2 transition-all",
                  useEmojis ? "bg-blue-400/10 border-blue-400 text-blue-400" : "bg-white/5 border-border-dark text-white/40"
                )}
              >
                <Smile className="w-4 h-4" />
                {useEmojis ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isProcessing || !profile}
            className="w-full py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Transcribing...
              </>
            ) : !profile ? (
              <>
                <Lock className="w-5 h-5" />
                Sign in to Generate
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Subtitles
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="glass-panel flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <span className="text-sm font-medium text-white/60">Subtitles Preview</span>
            {subtitles.length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
                  title="Copy to Clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-blue-400"
                  title="Download Subtitles"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
            {subtitles.length > 0 ? (
              subtitles.map((sub, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="flex gap-4 group"
                >
                  <span className="text-xs font-mono text-white/20 pt-1 w-20 shrink-0">
                    {sub.start.toFixed(2)}s - {sub.end.toFixed(2)}s
                  </span>
                  <div className="flex-1 p-3 bg-white/5 rounded-lg border border-transparent group-hover:border-blue-400/30 transition-colors">
                    <p className="text-sm">{sub.text}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                <Type className="w-12 h-12" />
                <p className="text-sm">Upload a video to generate subtitles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
