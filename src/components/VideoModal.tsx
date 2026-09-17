import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  downloadUrl?: string;
  description?: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl, title, downloadUrl, description }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('shorts/')) {
        videoId = url.split('shorts/')[1]?.split(/[?#]/)[0];
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split(/[?#]/)[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split(/[?#]/)[0];
      }
      
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      // Reverted parameters to standard embed: rel=0, playsinline=1
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${origin}`;
    }
    if (url.includes('drive.google.com')) {
      const fileId = url.split('/d/')[1]?.split('/')[0];
      // Google Drive preview link is the most reliable way to show the video
      return `https://drive.google.com/file/d/${fileId}/preview?autoplay=1`;
    }
    if (url.includes('instagram.com')) {
      // Extract the post ID from the Instagram URL
      const postId = url.split('/p/')[1]?.split('/')[0];
      return `https://www.instagram.com/p/${postId}/embed/`;
    }
    return url;
  };

  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isDrive = videoUrl.includes('drive.google.com');
  const isInstagram = videoUrl.includes('instagram.com');
  const isEmbed = isYouTube || isDrive || isInstagram;
  const isVertical = videoUrl.includes('shorts/') || videoUrl.includes('instagram.com');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (videoRef.current) {
        videoRef.current.volume = 1;
        videoRef.current.play().catch(err => console.log("Autoplay blocked or failed:", err));
      }
      resetTimer();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black cursor-pointer"
          onMouseMove={resetTimer}
          onClick={onClose}
        >
          {/* Background Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full h-full flex flex-col items-center justify-center z-10 p-4 md:p-10 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              onContextMenu={(e) => e.preventDefault()}
              className={`relative w-full ${isVertical ? 'max-w-[min(95vw,500px)] aspect-[9/16]' : 'max-w-6xl aspect-video'} bg-black rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden select-none`}
            >
              <div className={`w-full h-full relative group ${isVertical ? 'shorts-container' : ''}`}>
                {isEmbed ? (
                  <iframe
                    key={videoUrl}
                    src={getEmbedUrl(videoUrl)}
                    title={title}
                    className="absolute inset-0 w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    autoPlay
                    playsInline
                    onContextMenu={(e) => e.preventDefault()}
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    className="w-full h-full object-cover"
                    onLoadedMetadata={() => {
                      if (videoRef.current) videoRef.current.volume = 1;
                    }}
                  />
                )}
              </div>

              <AnimatePresence>
                {showControls && (
                  <>
                    {/* Close Button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="absolute top-4 right-4 text-white/70 hover:text-white transition-all hover:rotate-90 duration-300 z-[110] bg-black/60 backdrop-blur-md p-2.5 rounded-full border border-white/20 shadow-lg"
                      aria-label="Fechar"
                    >
                      <X size={20} strokeWidth={2.5} />
                    </motion.button>

                    {/* Floating "Ver mais" Button */}
                    <motion.a
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] bg-black/60 backdrop-blur-md px-4 py-8 rounded-full border border-white/20 text-white/70 text-[10px] uppercase tracking-[0.3em] font-bold [writing-mode:vertical-lr] hover:bg-white hover:text-black transition-all duration-300 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver mais
                    </motion.a>

                    {/* Floating Download Button (Left Side) */}
                    {downloadUrl && (
                      <motion.a
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] bg-black/60 backdrop-blur-md px-4 py-8 rounded-full border border-white/20 text-white/70 text-[10px] uppercase tracking-[0.3em] font-bold [writing-mode:vertical-lr] hover:bg-white hover:text-black transition-all duration-300 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Download
                      </motion.a>
                    )}

                    {/* Title & Description Overlay */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[110] text-center w-full px-16 pointer-events-none"
                    >
                      <h2 className="text-white text-[10px] uppercase tracking-[0.4em] font-light opacity-65">
                        {title}
                      </h2>
                      {description && (
                        <p className="text-white/50 text-[9px] mt-1 tracking-[0.2em] font-light max-w-md mx-auto line-clamp-2">
                          {description}
                        </p>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
