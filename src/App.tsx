/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Type, 
  BookOpen, 
  UserCircle, 
  Zap, 
  Settings, 
  Plus, 
  History,
  Play,
  Download,
  Share2,
  ChevronRight,
  Menu,
  X,
  Key,
  Sparkles,
  CreditCard,
  Crown,
  LogOut,
  LogIn,
  Check,
  Image as ImageIcon,
  Mic,
  FileText,
  Eraser,
  Scissors,
  Lock
} from 'lucide-react';
import { cn } from './lib/utils';
import { ToolType, Project } from './types';
import { auth, signIn, db, UserProfile, subscribeToProjects } from './services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import VideoMaker from './components/VideoMaker';
import SubtitleGen from './components/SubtitleGen';
import StoryGen from './components/StoryGen';
import AvatarGen from './components/AvatarGen';
import ViralMaker from './components/ViralMaker';
import ThumbnailMaker from './components/ThumbnailMaker';
import VoiceOver from './components/VoiceOver';
import ScriptGen from './components/ScriptGen';
import BgRemover from './components/BgRemover';
import AutoEditor from './components/AutoEditor';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('video-maker');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isRecentProjectsOpen, setIsRecentProjectsOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Listen to profile changes
        const unsubProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });

        // Listen to projects
        const unsubProjects = subscribeToProjects(firebaseUser.uid, (fetchedProjects) => {
          setProjects(fetchedProjects);
        });

        return () => {
          unsubProfile();
          unsubProjects();
        };
      } else {
        setProfile(null);
        setProjects([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsApiKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setIsApiKeySelected(true);
    }
  };

  const handleNewProject = (toolId: ToolType) => {
    setActiveTool(toolId);
    setIsNewProjectModalOpen(false);
    // In a real app, we might also clear some global state here
  };

  const tools = [
    { id: 'video-maker', name: 'AI Video Maker', icon: Video, color: 'text-emerald-400', desc: 'Generate cinematic videos from text' },
    { id: 'subtitle-gen', name: 'Subtitle Generator', icon: Type, color: 'text-blue-400', desc: 'Auto-transcribe and style captions' },
    { id: 'story-gen', name: 'Story Video', icon: BookOpen, color: 'text-purple-400', desc: 'Turn scripts into animated stories' },
    { id: 'avatar-gen', name: 'AI Avatar', icon: UserCircle, color: 'text-orange-400', desc: 'Create talking head presenter videos' },
    { id: 'viral-maker', name: 'Viral Video Maker', icon: Zap, color: 'text-yellow-400', desc: 'One-click viral social media content' },
    { id: 'thumbnail-maker', name: 'Thumbnail Maker', icon: ImageIcon, color: 'text-pink-400', desc: 'Generate viral YouTube thumbnails' },
    { id: 'voice-over', name: 'AI Voice Over', icon: Mic, color: 'text-indigo-400', desc: 'Professional narration from text' },
    { id: 'script-gen', name: 'Script Generator', icon: FileText, color: 'text-cyan-400', desc: 'Auto-generate scripts for YT/FB' },
    { id: 'bg-remover', name: 'BG Remover', icon: Eraser, color: 'text-rose-400', desc: 'Remove backgrounds without green screen' },
    { id: 'auto-editor', name: 'AI Auto Editor', icon: Scissors, color: 'text-lime-400', desc: 'Smart cuts, transitions, and music' },
  ];

  const NewProjectModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      onClick={() => setIsNewProjectModalOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="max-w-2xl w-full glass-panel p-8 space-y-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-display font-bold">Start a New Project</h3>
          <p className="text-white/60">Choose a tool to begin your creative journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleNewProject(tool.id as ToolType)}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-border-dark hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all text-left group"
            >
              <div className={cn("p-3 rounded-xl bg-white/5 group-hover:bg-brand-primary/10 transition-colors", tool.color)}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold group-hover:text-brand-primary transition-colors">{tool.name}</p>
                <p className="text-xs text-white/40 leading-relaxed">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsNewProjectModalOpen(false)}
          className="w-full py-3 text-white/40 hover:text-white transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );

  const RecentProjectsModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      onClick={() => setIsRecentProjectsOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="max-w-4xl w-full glass-panel p-8 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-3xl font-display font-bold">Recent Projects</h3>
            <p className="text-white/60">Your creative history and generated content</p>
          </div>
          <button 
            onClick={() => setIsRecentProjectsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-40">
            <History className="w-16 h-16 mx-auto" />
            <p className="text-lg">No projects found yet. Start creating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="p-4 rounded-2xl bg-white/5 border border-border-dark hover:border-brand-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-brand-primary/10">
                      {tools.find(t => t.id === project.type)?.icon && (
                        React.createElement(tools.find(t => t.id === project.type)!.icon, { className: "w-5 h-5 text-brand-primary" })
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold truncate max-w-[150px]">{project.title}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">
                        {tools.find(t => t.id === project.type)?.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/20">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {project.videoUrl && (
                    <a 
                      href={project.videoUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-3 h-3" />
                      View Video
                    </a>
                  )}
                  {project.audioUrl && (
                    <a 
                      href={project.audioUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Mic className="w-3 h-3" />
                      Listen
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );


  const SettingsModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
      onClick={() => setIsSettingsOpen(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="max-w-md w-full glass-panel p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-brand-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold">Settings</h3>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-border-dark space-y-2">
            <p className="text-sm font-bold text-white/40 uppercase tracking-wider">Account</p>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60 truncate max-w-[150px]">{user.email}</span>
                  <button onClick={() => signOut(auth)} className="text-xs text-red-400 hover:underline flex items-center gap-1">
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-brand-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider">Lifetime Ultra Member</span>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="w-full py-2 bg-brand-primary text-bg-dark rounded-lg text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign In to Sync Credits
              </button>
            )}
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-border-dark space-y-2">
            <p className="text-sm font-bold text-white/40 uppercase tracking-wider">API Configuration</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Key</span>
              <span className="text-xs px-2 py-1 bg-brand-primary/20 text-brand-primary rounded-md font-mono">Configured</span>
            </div>
            <button 
              onClick={handleSelectKey}
              className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors"
            >
              Change API Key
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-border-dark space-y-2">
            <p className="text-sm font-bold text-white/40 uppercase tracking-wider">Preferences</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Theme</span>
              <span className="text-xs text-white/40">Dark (Default)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-save Projects</span>
              <div className="w-10 h-5 bg-brand-primary rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-bg-dark rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(false)}
          className="w-full py-3 bg-brand-primary text-bg-dark font-bold rounded-xl hover:scale-[1.02] transition-transform"
        >
          Save Changes
        </button>
      </motion.div>
    </motion.div>
  );

  if (!isApiKeySelected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark p-6">
        <div className="max-w-md w-full glass-panel p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Video className="w-10 h-10 text-brand-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold">VividAI Studio</h1>
            <p className="text-white/60">To use professional AI video generation, please select your Google Cloud API key with billing enabled.</p>
          </div>
          <button 
            onClick={handleSelectKey}
            className="w-full py-4 bg-brand-primary text-bg-dark font-bold rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            Select API Key
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-white/40">
            Requires a paid API key. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline text-brand-primary">Learn more about billing</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg-dark overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="border-r border-border-dark bg-surface-dark flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-bg-dark" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">VividAI</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolType)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group hover:scale-[1.02] active:scale-[0.98]",
                activeTool === tool.id 
                  ? "bg-brand-primary/10 text-brand-primary" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <tool.icon className={cn("w-6 h-6 shrink-0 transition-transform group-hover:scale-110", activeTool === tool.id ? "text-brand-primary" : "group-hover:text-white")} />
              {isSidebarOpen && <span className="font-medium">{tool.name}</span>}
              {activeTool === tool.id && isSidebarOpen && (
                <motion.div layoutId="activeTool" className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border-dark space-y-2">
          {user && (
            <div className="px-3 py-2 bg-white/5 rounded-xl border border-border-dark mb-2">
              <div className="flex items-center gap-2 mb-1">
                <UserCircle className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-medium truncate">{user.email}</span>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="w-full text-left text-[10px] text-red-400 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-3 p-3 text-white/60 hover:bg-white/5 rounded-xl transition-colors"
          >
            <Settings className="w-6 h-6" />
            {isSidebarOpen && <span className="font-medium">Settings</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-border-dark flex items-center justify-between px-8 bg-surface-dark/50 backdrop-blur-md z-10">
          <h2 className="text-lg font-medium text-white/80">
            {tools.find(t => t.id === activeTool)?.name}
          </h2>
          <div className="flex items-center gap-4">
            {!user && (
              <button 
                onClick={signIn}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg text-sm font-bold hover:bg-brand-primary/20 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
            <button 
              onClick={handleSelectKey}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-border-dark rounded-lg text-sm font-medium transition-colors"
            >
              <Key className="w-4 h-4" />
              API Key
            </button>
            {profile && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-border-dark rounded-full">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-xs font-bold">Unlimited Credits</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Ultra Member</span>
                </div>
              </div>
            )}
            <button 
              onClick={() => setIsRecentProjectsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
            >
              <History className="w-4 h-4" />
              Recent Projects
            </button>
            <button 
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-bg-dark rounded-lg text-sm font-bold hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto h-full"
            >
              {activeTool === 'video-maker' && <VideoMaker profile={profile} />}
              {activeTool === 'subtitle-gen' && <SubtitleGen profile={profile} />}
              {activeTool === 'story-gen' && <StoryGen profile={profile} />}
              {activeTool === 'avatar-gen' && <AvatarGen profile={profile} />}
              {activeTool === 'viral-maker' && <ViralMaker profile={profile} />}
              {activeTool === 'thumbnail-maker' && <ThumbnailMaker profile={profile} />}
              {activeTool === 'voice-over' && <VoiceOver profile={profile} />}
              {activeTool === 'script-gen' && <ScriptGen profile={profile} />}
              {activeTool === 'bg-remover' && <BgRemover profile={profile} />}
              {activeTool === 'auto-editor' && <AutoEditor profile={profile} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isSettingsOpen && <SettingsModal />}
        {isNewProjectModalOpen && <NewProjectModal />}
        {isRecentProjectsOpen && <RecentProjectsModal />}
      </AnimatePresence>
    </div>
  );
}

