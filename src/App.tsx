import React, { useState, useCallback } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer, Track } from './components/MusicPlayer';

const DUMMY_TRACKS: Track[] = [
  {
    id: '1',
    title: 'SEQ_01: NEURAL_DECAY',
    artist: 'SYS.OP.1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverColor: '#FF00FF',
  },
  {
    id: '2',
    title: 'SEQ_02: KINETIC_VOID',
    artist: 'SYS.OP.2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverColor: '#00FFFF',
  },
  {
    id: '3',
    title: 'SEQ_03: GHOST_IN_MACHINE',
    artist: 'SYS.OP.3',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverColor: '#FF00FF',
  },
];

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    setHighScore(prev => newScore > prev ? newScore : prev);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    handleNext();
  };

  return (
    <div className="min-h-screen bg-black text-[#00FFFF] font-mono selection:bg-[#FF00FF] selection:text-black overflow-hidden relative">
      <div className="static-noise"></div>
      <div className="scanlines"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col h-screen">
        
        <header className="flex justify-between items-end mb-8 border-b-4 border-[#FF00FF] pb-4 screen-tear">
          <div>
            <h1 className="text-4xl md:text-6xl font-display uppercase text-[#00FFFF] glitch" data-text="SYS.SNAKE_PROTOCOL">
              SYS.SNAKE_PROTOCOL
            </h1>
            <p className="text-[#FF00FF] text-xl mt-2 tracking-widest">STATUS: ONLINE // AWAITING_INPUT</p>
          </div>
          
          <div className="flex items-center gap-8 text-right">
            <div>
              <p className="text-sm text-[#FF00FF] uppercase tracking-widest">DATA_YIELD</p>
              <p className="text-4xl font-bold text-[#00FFFF]">
                {score.toString().padStart(4, '0')}
              </p>
            </div>
            <div className="w-1 h-12 bg-[#FF00FF]"></div>
            <div>
              <p className="text-sm text-[#FF00FF] uppercase tracking-widest">MAX_YIELD</p>
              <p className="text-4xl font-bold text-[#00FFFF]">
                {highScore.toString().padStart(4, '0')}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-16">
          
          <div className="flex-1 flex justify-center items-center w-full max-w-2xl">
            <SnakeGame 
              onScoreUpdate={handleScoreUpdate} 
              isMusicPlaying={isPlaying} 
            />
          </div>

          <div className="w-full lg:w-[450px] flex flex-col gap-6">
            <div className="border-b-2 border-[#00FFFF] pb-2 mb-2 screen-tear">
              <h2 className="text-2xl font-display text-[#FF00FF] uppercase tracking-widest">AUDIO_STREAM</h2>
            </div>
            
            <MusicPlayer
              tracks={DUMMY_TRACKS}
              currentTrackIndex={currentTrackIndex}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrev={handlePrev}
              onTrackEnd={handleTrackEnd}
            />

            <div className="mt-4 brutal-border-magenta bg-black p-4">
              <h3 className="text-xl font-display text-[#00FFFF] uppercase tracking-widest mb-4">AUDIO_NODES</h3>
              <div className="space-y-4">
                {DUMMY_TRACKS.map((track, idx) => (
                  <div 
                    key={track.id}
                    className={`flex items-center gap-4 p-3 transition-none cursor-pointer border-2 ${
                      idx === currentTrackIndex 
                        ? 'bg-[#FF00FF] text-black border-[#FF00FF]' 
                        : 'bg-black text-[#00FFFF] border-[#00FFFF] hover:bg-[#00FFFF] hover:text-black'
                    }`}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="text-2xl font-display">
                      {idx === currentTrackIndex && isPlaying ? '>' : '-'}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xl truncate font-bold">
                        {track.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
