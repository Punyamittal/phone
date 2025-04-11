"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Clock,
  Heart,
  Share2,
  Plus,
  Bookmark,
  MessageSquare,
  Settings,
  ChevronDown,
  Download,
  Subtitles,
  Sparkles,
  ListMusic
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { type YouTubeVideo } from "@/lib/youtubeApi";

// Interface for the YouTube IFrame API
interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  setPlaybackQuality: (quality: string) => void;
  getAvailableQualityLevels: () => string[];
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getVideoLoadedFraction: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: Record<string, any>;
          events?: Record<string, (event: any) => void>;
        }
      ) => YouTubePlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
  }
}

interface VideoPlayerProps {
  video: YouTubeVideo;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  relatedVideos?: YouTubeVideo[];
}

export function VideoPlayer({ 
  video, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious,
  relatedVideos = []
}: VideoPlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(100);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoQuality, setVideoQuality] = useState("auto");
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const playerElementRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isOpen) return;

    // Create YouTube script element if it doesn't exist
    if (!document.getElementById('youtube-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize YouTube Player when API is ready
    const initPlayer = () => {
      if (!playerElementRef.current) return;
      
      const player = new window.YT.Player('youtube-player', {
        videoId: video.id,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          cc_load_policy: subtitlesEnabled ? 1 : 0,
          iv_load_policy: 3, // Hide annotations
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
      
      playerRef.current = player;
    };

    // If API is already loaded
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Wait for API to load
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isOpen, video.id, subtitlesEnabled]);

  // Player event handlers
  const onPlayerReady = (event: any) => {
    setIsPlayerReady(true);
    setDuration(event.target.getDuration());
    setAvailableQualities(event.target.getAvailableQualityLevels());
    
    // Set initial volume
    event.target.setVolume(volume);
    
    // Start progress tracking
    progressIntervalRef.current = setInterval(updateProgress, 500);
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    
    if (playerState === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (playerState === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (playerState === window.YT.PlayerState.ENDED) {
      setIsPlaying(false);
      // Auto-play next video if available
      if (onNext) {
        setTimeout(onNext, 1000);
      }
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event.data);
    toast.error("Error playing video. Please try again.");
  };

  // Update progress bar
  const updateProgress = useCallback(() => {
    if (!playerRef.current) return;
    
    try {
      const currentTime = playerRef.current.getCurrentTime() || 0;
      setProgress(currentTime);
      
      // Update buffer progress
      const buffered = playerRef.current.getVideoLoadedFraction();
      setBufferProgress(buffered * playerRef.current.getDuration());
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  }, []);
  
  // Player control functions
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted]);
  
  const handleVolumeChange = useCallback((newVolume: number[]) => {
    if (!playerRef.current) return;
    
    const vol = newVolume[0];
    setVolume(vol);
    playerRef.current.setVolume(vol);
    
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    }
  }, [isMuted]);

  const handleSeek = useCallback((value: number[]) => {
    if (!playerRef.current) return;
    
    const seekTime = value[0];
    playerRef.current.seekTo(seekTime, true);
    setProgress(seekTime);
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (!playerRef.current) return;
    
    playerRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
    toast.success(`Playback speed: ${rate}x`);
  }, []);

  const handleQualityChange = useCallback((quality: string) => {
    if (!playerRef.current) return;
    
    playerRef.current.setPlaybackQuality(quality);
    setVideoQuality(quality);
    toast.success(`Video quality: ${quality.toUpperCase()}`);
  }, []);

  const toggleSubtitles = useCallback(() => {
    setSubtitlesEnabled(prev => !prev);
    // This will cause the player to reinitialize with new cc_load_policy
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const wasPlaying = isPlaying;
      
      // Reinitialize player with new subtitle setting
      playerRef.current = null;
      setIsPlayerReady(false);
      
      // After player reinitializes, seek to current position and resume if playing
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.seekTo(currentTime, true);
          if (wasPlaying) {
            playerRef.current.playVideo();
          }
        }
      }, 1000);
    }
    
    toast.success(subtitlesEnabled ? "Subtitles disabled" : "Subtitles enabled");
  }, [subtitlesEnabled, isPlaying]);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Handle toggling fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Add listener for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Hide controls after a period of inactivity
  useEffect(() => {
    const showControlsTemporarily = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControlsTemporarily);
      container.addEventListener('click', showControlsTemporarily);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', showControlsTemporarily);
        container.removeEventListener('click', showControlsTemporarily);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Clean up when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [video.id]);

  // Toggle like status
  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from liked videos" : "Added to liked videos");
  };

  // Toggle bookmark status
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks");
  };

  // Share video
  const handleShare = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.id}`);
    toast.success("Link copied to clipboard");
  };

  // Add to playlist (placeholder)
  const handleAddToPlaylist = () => {
    toast.success("Added to playlist");
  };

  // Download video (placeholder - actually would redirect to a service)
  const handleDownload = () => {
    toast.success("Download started...");
    window.open(`https://www.y2mate.com/youtube/${video.id}`, '_blank');
  };

  // Handle related video click
  const handleRelatedVideoClick = (relatedVideo: YouTubeVideo) => {
    // In a real app, you would update the current video and reset the player
    toast.info(`Loading: ${relatedVideo.title}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            ref={playerContainerRef}
            className={cn(
              "relative w-full max-w-6xl rounded-lg overflow-hidden",
              isFullscreen ? "h-screen max-h-screen" : "max-h-[90vh]" 
            )}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              {/* YouTube iframe will be inserted here by the API */}
              <div id="youtube-player" ref={playerElementRef} className="absolute inset-0 w-full h-full"></div>
              
              {/* Gradient overlay for controls visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              
              {/* Loading indicator */}
              {!isPlayerReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              
              {/* Video Controls Overlay */}
              <AnimatePresence>
                {showControls && (
                  <motion.div 
                    className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/30 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Top Controls */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-black/50 text-white border-none">
                          HD
                        </Badge>
                        <Badge variant="outline" className="bg-black/50 text-white border-none">
                          {playbackRate}x
                        </Badge>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white hover:bg-black/30"
                        onClick={onClose}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {/* Center Play/Pause Button with ripple effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <AnimatePresence>
                        {!isPlaying && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="h-16 w-16 rounded-full bg-primary/80 flex items-center justify-center pointer-events-auto cursor-pointer relative overflow-hidden group"
                            onClick={togglePlay}
                          >
                            <motion.div
                              className="absolute inset-0 bg-white/20 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 2], opacity: [0.5, 0] }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 1.5, 
                                ease: "easeOut",
                                repeatDelay: 0.5
                              }}
                            />
                            <Play className="h-8 w-8 text-white" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Bottom Controls */}
                    <div className="space-y-2">
                      {/* Progress Bar with buffer indicator */}
                      <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                        {/* Buffer progress */}
                        <div 
                          className="absolute h-full bg-white/30 rounded-full"
                          style={{ width: `${(bufferProgress / duration) * 100}%` }}
                        />
                        
                        {/* Playback progress */}
                        <Slider
                          value={[progress]}
                          max={duration}
                          step={1}
                          className="absolute inset-0"
                          onValueChange={handleSeek}
                        />
                      </div>
                      
                      {/* Time and Duration */}
                      <div className="flex items-center justify-between text-xs text-white">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      
                      {/* Control Buttons */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-white hover:bg-black/30"
                            onClick={togglePlay}
                          >
                            {isPlaying ? (
                              <Pause className="h-5 w-5" />
                            ) : (
                              <Play className="h-5 w-5" />
                            )}
                          </Button>
                          
                          {onPrevious && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-white hover:bg-black/30"
                              onClick={onPrevious}
                            >
                              <SkipBack className="h-5 w-5" />
                            </Button>
                          )}
                          
                          {onNext && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-white hover:bg-black/30"
                              onClick={onNext}
                            >
                              <SkipForward className="h-5 w-5" />
                            </Button>
                          )}
                          
                          {/* Volume Control with slider */}
                          <div className="relative" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-white hover:bg-black/30"
                              onClick={toggleMute}
                            >
                              {isMuted || volume === 0 ? (
                                <VolumeX className="h-5 w-5" />
                              ) : (
                                <Volume2 className="h-5 w-5" />
                              )}
                            </Button>
                            
                            <AnimatePresence>
                              {showVolumeSlider && (
                                <motion.div 
                                  className="absolute -left-8 bottom-full mb-2 p-3 bg-black/80 rounded-lg w-32"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                >
                                  <Slider
                                    value={[volume]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={handleVolumeChange}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {/* Playback speed dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white hover:bg-black/30 text-xs">
                                {playbackRate}x
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-24">
                              <DropdownMenuLabel>Speed</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                <DropdownMenuItem 
                                  key={rate} 
                                  className={cn(playbackRate === rate && "bg-primary/20")}
                                  onClick={() => handlePlaybackRateChange(rate)}
                                >
                                  {rate}x {playbackRate === rate && '✓'}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          {/* Quality selector */}
                          {availableQualities.length > 0 && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-white hover:bg-black/30 text-xs">
                                  <Settings className="h-3.5 w-3.5 mr-1" />
                                  HD
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuLabel>Quality</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className={cn(videoQuality === 'auto' && "bg-primary/20")}
                                  onClick={() => handleQualityChange('auto')}
                                >
                                  Auto {videoQuality === 'auto' && '✓'}
                                </DropdownMenuItem>
                                {availableQualities.map((quality) => (
                                  <DropdownMenuItem 
                                    key={quality} 
                                    className={cn(videoQuality === quality && "bg-primary/20")}
                                    onClick={() => handleQualityChange(quality)}
                                  >
                                    {quality.toUpperCase()} {videoQuality === quality && '✓'}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          
                          {/* Subtitles toggle */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn(
                              "text-white hover:bg-black/30",
                              subtitlesEnabled && "text-primary"
                            )}
                            onClick={toggleSubtitles}
                          >
                            <Subtitles className="h-4 w-4" />
                          </Button>
                          
                          {/* Fullscreen toggle */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-white hover:bg-black/30"
                            onClick={toggleFullscreen}
                          >
                            {isFullscreen ? (
                              <Minimize2 className="h-5 w-5" />
                            ) : (
                              <Maximize2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Video Information Area */}
            {!isFullscreen && (
              <Card className="border-t-0 rounded-t-none">
                <CardContent className="p-0">
                  <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full rounded-none grid grid-cols-3">
                      <TabsTrigger value="info">Information</TabsTrigger>
                      <TabsTrigger value="related">Related</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="p-4">
                      <div className="space-y-4">
                        <div>
                          <motion.h2 
                            className="text-2xl font-bold"
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            {video.title}
                          </motion.h2>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span>{video.channelTitle}</span>
                            <span>•</span>
                            <span>{format(new Date(video.publishedAt), 'MMM dd, yyyy')}</span>
                            <span>•</span>
                            <span>{video.viewCount ? `${parseInt(video.viewCount).toLocaleString()} views` : 'N/A views'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-y py-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "flex items-center gap-1",
                              isLiked && "text-primary"
                            )}
                            onClick={handleLike}
                          >
                            <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                            <span>Like</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                              "flex items-center gap-1",
                              isBookmarked && "text-primary"
                            )}
                            onClick={handleBookmark}
                          >
                            <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
                            <span>Save</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={handleShare}
                          >
                            <Share2 className="h-4 w-4" />
                            <span>Share</span>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <Plus className="h-4 w-4" />
                                <span>More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={handleAddToPlaylist}>
                                <ListMusic className="h-4 w-4 mr-2" />
                                Add to playlist
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success("AI Summary requested")}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate AI Summary
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-2">Description</h3>
                          <motion.p 
                            className="text-sm text-muted-foreground whitespace-pre-line" 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                          >
                            {video.description}
                          </motion.p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="related" className="p-4">
                      <h3 className="font-medium mb-2">Related Videos</h3>
                      {relatedVideos.length > 0 ? (
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-3">
                            {relatedVideos.map((relatedVideo) => (
                              <motion.div 
                                key={relatedVideo.id} 
                                className="flex gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                                onClick={() => handleRelatedVideoClick(relatedVideo)}
                                whileHover={{ x: 5 }}
                              >
                                <div className="relative w-32 h-18 overflow-hidden rounded-md">
                                  <img 
                                    src={relatedVideo.thumbnailUrl} 
                                    alt={relatedVideo.title} 
                                    className="w-full h-full object-cover" 
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium line-clamp-2">{relatedVideo.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{relatedVideo.channelTitle}</p>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{format(new Date(relatedVideo.publishedAt), 'MMM dd, yyyy')}</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p className="text-muted-foreground text-sm">No related videos available</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="comments" className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-muted" />
                        <div className="flex-1">
                          <input 
                            type="text" 
                            placeholder="Add a comment..." 
                            className="w-full px-3 py-2 bg-muted border-none rounded-full focus:outline-none focus:ring-1 focus:ring-primary" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-medium">Comments</h3>
                      </div>
                      
                      {/* Comment examples */}
                      <div className="space-y-4">
                        {[1, 2, 3].map((index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">User {index}</p>
                                <span className="text-xs text-muted-foreground">2 days ago</span>
                              </div>
                              <p className="text-sm mt-1">This is an example comment. Great video!</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 