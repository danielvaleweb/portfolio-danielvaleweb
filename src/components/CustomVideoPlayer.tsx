import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, RotateCcw, RotateCw, MessageSquare } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  onClose?: () => void;
  onComment?: (text: string) => void;
}

export default function CustomVideoPlayer({ src, title, poster, onClose, onComment }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Auto-hide controls when mouse leaves or after 3s of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetTimer);
      container.addEventListener('mouseleave', () => {
        if (isPlaying) setShowControls(false);
      });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mousemove', resetTimer);
      }
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      if (total) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const skipTime = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    const h = Math.floor(m / 60);
    if (h > 0) {
      const rm = m % 60;
      return `${h}:${rm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef} 
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden group font-sans text-white select-none"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        playsInline
      />
      
      {/* Top Controls (Flag/Report) */}
      <div 
        className={`absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <button onClick={() => { if (onClose) onClose(); else window.history.back(); }} className="text-white hover:text-gray-300 p-2">
          {/* Using a simple back arrow like image */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        
      </div>

      {/* Play Overlay (when paused) */}
      {!isPlaying && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 m-auto flex items-center justify-center w-20 h-20 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-colors z-10"
        >
          <Play size={40} fill="white" strokeWidth={1.5} className="ml-1" />
        </button>
      )}

      {/* Bottom Controls */}
      <div 
        className={`absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 pb-6 pt-12 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-2">
          <div 
            className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative group/progress"
            onClick={handleSeek}
          >
            {/* Hover preview would go here */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full pointer-events-none"
              style={{ width: `${progress}%` }}
            >
              {/* Thumb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transform scale-0 group-hover/progress:scale-100 transition-transform"></div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-white/90 tabular-nums">
            {formatTime(duration)}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors cursor-pointer">
              {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
            </button>
            <button onClick={() => skipTime(-10)} className="text-white hover:text-gray-300 transition-colors relative flex items-center justify-center">
              <RotateCcw size={24} />
              <span className="absolute text-[9px] font-bold mt-0.5">10</span>
            </button>
            <button onClick={() => skipTime(10)} className="text-white hover:text-gray-300 transition-colors relative flex items-center justify-center">
              <RotateCw size={24} />
              <span className="absolute text-[9px] font-bold mt-0.5">10</span>
            </button>
            <div className="flex items-center gap-2 group/vol py-2 -my-2 pr-2">
              <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors cursor-pointer">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              {/* Custom Volume Slider */}
              <div 
                className="relative w-16 h-1 bg-white/30 rounded-full cursor-pointer opacity-0 group-hover/vol:opacity-100 transition-opacity group/volbar ml-2 mt-0.5"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  // We need to call the handleVolumeChange logic, or inline it
                  const syntheticEvent = { target: { value: pos.toString() } } as React.ChangeEvent<HTMLInputElement>;
                  handleVolumeChange(syntheticEvent);
                }}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full pointer-events-none"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full transform scale-0 group-hover/volbar:scale-100 transition-transform shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 text-center truncate px-4">
            <span className="text-sm font-medium text-white">{title || ''}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group/comment flex items-center">
              <button onClick={() => setShowCommentBox(!showCommentBox)} className="text-white hover:text-gray-300 transition-colors cursor-pointer group relative" title="Comentar">
                <MessageSquare size={20} />
              </button>
              
              <AnimatePresence>
                {showCommentBox && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-4 w-72 bg-black/90 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-2xl flex flex-col gap-3 cursor-auto z-50"
                  >
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider">Deixe um comentário</h4>
                    <textarea
                      autoFocus
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Escreva seu comentário aqui..."
                      className="w-full bg-white/10 text-white text-[13px] rounded-lg p-3 outline-none resize-none min-h-[80px] placeholder:text-gray-400 focus:bg-white/20 transition-colors"
                    />
                    <div className="flex justify-end gap-2 mt-1">
                      <button onClick={() => setShowCommentBox(false)} className="text-[11px] text-gray-400 hover:text-white px-3 py-2 transition-colors cursor-pointer">Cancelar</button>
                      <button 
                        onClick={() => {
                          if (commentText.trim() && onComment) {
                            onComment(commentText);
                            setCommentText("");
                            setShowCommentBox(false);
                          }
                        }} 
                        className="text-[11px] bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Enviar
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Velocidade de reprodução onClick */}
            <div className="relative flex items-center">
              <button 
                onClick={(e) => {
                  e.currentTarget.nextElementSibling?.classList.toggle('hidden');
                  e.currentTarget.nextElementSibling?.classList.toggle('flex');
                }} 
                className="text-white hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center" 
                title="Velocidade de Reprodução"
              >
                <Settings size={20} />
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden flex-col bg-black/90 backdrop-blur-md rounded-lg overflow-hidden border border-white/10 text-xs shadow-xl">
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button 
                    key={speed} 
                    onClick={(e) => { 
                    if (videoRef.current) videoRef.current.playbackRate = speed; 
                    e.currentTarget.parentElement?.classList.add('hidden');
                    e.currentTarget.parentElement?.classList.remove('flex');
                  }}
                    className="px-4 py-2 hover:bg-white/20 text-white text-left transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
            <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center">
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
