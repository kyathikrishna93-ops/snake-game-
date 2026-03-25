import React, { useEffect, useRef, useState } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverColor: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onTrackEnd: () => void;
}

export function MusicPlayer({
  tracks,
  currentTrackIndex,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onTrackEnd,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full brutal-border bg-black p-6 relative">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={onTrackEnd}
      />

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex-1 overflow-hidden border-b-2 border-[#FF00FF] pb-2">
          <h3 className="text-[#00FFFF] font-display text-xl truncate tracking-widest uppercase">
            {currentTrack.title}
          </h3>
          <p className="text-[#FF00FF] text-lg font-mono truncate mt-2">
            AUTHOR: {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={progress}
          onChange={handleSeek}
          className="w-full h-4 bg-black border-2 border-[#00FFFF] appearance-none cursor-pointer accent-[#FF00FF]"
        />
        <div className="flex justify-between mt-2 text-lg font-mono text-[#00FFFF]">
          <span>T-{formatTime(progress)}</span>
          <span>T-{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between border-t-2 border-[#FF00FF] pt-6">
        <button 
          onClick={onPrev}
          className="px-4 py-2 bg-black text-[#00FFFF] border-2 border-[#00FFFF] hover:bg-[#00FFFF] hover:text-black font-display text-sm transition-none"
        >
          [PREV]
        </button>
        
        <button 
          onClick={onPlayPause}
          className="px-6 py-3 bg-[#FF00FF] text-black border-2 border-[#FF00FF] hover:bg-black hover:text-[#FF00FF] font-display text-lg transition-none screen-tear"
        >
          {isPlaying ? 'HALT' : 'EXECUTE'}
        </button>
        
        <button 
          onClick={onNext}
          className="px-4 py-2 bg-black text-[#00FFFF] border-2 border-[#00FFFF] hover:bg-[#00FFFF] hover:text-black font-display text-sm transition-none"
        >
          [NEXT]
        </button>
      </div>
    </div>
  );
}
