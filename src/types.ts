export interface Subtitle {
  start: number;
  end: number;
  text: string;
}

export type ToolType = 
  | 'video-maker' 
  | 'subtitle-gen' 
  | 'story-gen' 
  | 'avatar-gen' 
  | 'viral-maker' 
  | 'thumbnail-maker' 
  | 'voice-over' 
  | 'script-gen' 
  | 'bg-remover' 
  | 'auto-editor';

export interface Project {
  id: string;
  title: string;
  type: ToolType;
  createdAt: string;
  videoUrl?: string;
  audioUrl?: string;
  subtitles?: Subtitle[];
}
