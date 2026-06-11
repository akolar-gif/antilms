"use client";

import { useState, useRef, useEffect } from "react";
import { LearningBlock } from "@/types";
import { Play, Pause, Volume2, VolumeX, RotateCcw, SkipForward, Radio } from "lucide-react";
import { useTranslation } from "@/components/layout/language-context";

export function AudioBlock({ block, onComplete }: { block: LearningBlock; onComplete?: () => void }) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const audioUrl = block.content || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  // Sync state with HTML5 audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Trigger complete when user has listened to at least 90% of the audio
      if (audio.duration && audio.currentTime / audio.duration >= 0.9 && onComplete) {
        onComplete();
      }
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (onComplete) onComplete();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [onComplete]);

  // Handle Play/Pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(err => console.log("Play failed:", err));
      setIsPlaying(true);
    }
  };

  // Adjust Speed
  const cycleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;

    let nextSpeed = 1;
    if (speed === 1) nextSpeed = 1.5;
    else if (speed === 1.5) nextSpeed = 2;
    else nextSpeed = 1;

    audio.playbackRate = nextSpeed;
    setSpeed(nextSpeed);
  };

  // Skip 10 seconds back or forward
  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
  };

  // Handle Slider Clicks
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progress = progressRef.current;
    if (!audio || !progress) return;

    const rect = progress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const clickPercentage = clickX / width;
    
    audio.currentTime = clickPercentage * (audio.duration || 0);
  };

  // Toggle Mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = val;
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      audio.muted = true;
    } else {
      setIsMuted(false);
      audio.muted = false;
    }
  };

  // Format MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="cell border border-line rounded-2xl bg-paper p-6 flex flex-col gap-5 relative overflow-hidden shadow-sm">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Decorative equalizer bars */}
      {isPlaying && (
        <div className="absolute right-6 top-6 flex items-end gap-[3px] h-6">
          <span className="w-[3px] bg-coral/60 rounded-full animate-[bounce_0.8s_infinite_0.1s] h-4"></span>
          <span className="w-[3px] bg-coral/70 rounded-full animate-[bounce_0.6s_infinite_0.3s] h-6"></span>
          <span className="w-[3px] bg-coral/80 rounded-full animate-[bounce_0.9s_infinite_0.2s] h-3"></span>
          <span className="w-[3px] bg-coral/60 rounded-full animate-[bounce_0.7s_infinite_0.4s] h-5"></span>
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-coral/10 text-coral rounded-xl flex items-center justify-center border border-coral/20">
          <Radio className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex-1">
          <span className="eyebrow text-coral block mb-1">{t("audio.badge")}</span>
          <h3 className="font-display font-extrabold text-lg text-ink leading-tight pr-12">{block.title}</h3>
        </div>
      </div>

      {/* Progress & Duration */}
      <div className="space-y-2">
        <div 
          ref={progressRef}
          onClick={handleProgressClick}
          className="relative w-full h-2 bg-paper-3 rounded-full cursor-pointer overflow-hidden border border-line-soft transition-all hover:h-2.5 group"
        >
          <div 
            style={{ width: `${progressPercent}%` }}
            className="absolute top-0 left-0 h-full bg-coral rounded-full transition-all duration-75"
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-ink-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-line-soft">
        <div className="flex items-center gap-2">
          {/* Skip Back */}
          <button 
            onClick={() => skipTime(-10)} 
            className="w-8 h-8 rounded-lg border border-line-soft flex items-center justify-center text-ink hover:bg-paper-2 hover:border-line transition-all active:scale-95"
            title="-10s"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause Button */}
          <button 
            onClick={togglePlay}
            className="w-11 h-11 rounded-xl bg-coral hover:bg-coral-d text-paper flex items-center justify-center transition-all shadow-md hover:shadow-lg active:scale-95 border border-ink"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Skip Forward */}
          <button 
            onClick={() => skipTime(10)} 
            className="w-8 h-8 rounded-lg border border-line-soft flex items-center justify-center text-ink hover:bg-paper-2 hover:border-line transition-all active:scale-95"
            title="+10s"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Indicator */}
        <div className="flex items-center gap-4">
          <button 
            onClick={cycleSpeed}
            className="px-3 py-1.5 rounded-lg border border-line-soft font-mono text-[10px] font-bold text-ink hover:bg-paper-2 hover:border-line transition-all"
          >
            {speed}x
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className="text-ink-2 hover:text-ink transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-paper-3 rounded-full appearance-none cursor-pointer accent-coral"
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
}
