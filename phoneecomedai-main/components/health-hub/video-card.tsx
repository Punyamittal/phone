"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlayCircle, Calendar, Eye, ExternalLink, Bookmark, Share2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { VideoPlayer } from "./video-player";

import type { YouTubeVideo } from "@/lib/youtubeApi";

interface VideoCardProps {
  video: YouTubeVideo;
  priority?: boolean;
  relatedVideos?: YouTubeVideo[];
  onNextVideo?: () => void;
  onPreviousVideo?: () => void;
}

export function VideoCard({ 
  video, 
  priority = false, 
  relatedVideos = [],
  onNextVideo,
  onPreviousVideo
}: VideoCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  const formattedDate = video.publishedAt 
    ? format(new Date(video.publishedAt), 'MMM dd, yyyy')
    : 'Unknown date';
    
  const formatViewCount = (count?: string) => {
    if (!count) return 'N/A views';
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };
  
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? "Video removed from bookmarks" : "Video added to bookmarks");
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${video.id}`);
    toast.success("Video link copied to clipboard");
  };
  
  const openVideo = () => {
    setIsPlayerOpen(true);
  };
  
  const openExternalVideo = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, "_blank");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: priority ? 0 : 0.2 }}
        viewport={{ once: true }}
        className="h-full"
      >
        <Card 
          className={cn(
            "h-full overflow-hidden transition-all duration-300 hover:shadow-lg",
            isHovered ? "scale-[1.02]" : "scale-100"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative cursor-pointer group" onClick={openVideo}>
            <div className="aspect-video overflow-hidden bg-muted">
              <motion.img
                src={video.thumbnailUrl}
                alt={video.title}
                className="object-cover w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                className="bg-primary/80 rounded-full p-3"
              >
                <PlayCircle className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            
            <Badge className="absolute top-2 right-2 bg-primary/90">
              {formatViewCount(video.viewCount)}
            </Badge>
            
            {/* Add duration badge (this would normally come from the API) */}
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
              12:34
            </Badge>
          </div>
          
          <CardHeader className="p-4 pb-0">
            <CardTitle className="line-clamp-2 text-lg hover:text-primary cursor-pointer" onClick={openVideo}>
              {video.title}
            </CardTitle>
            <CardDescription className="line-clamp-1">{video.channelTitle}</CardDescription>
          </CardHeader>
          
          <CardContent className="p-4 pt-2">
            <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
            
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{formatViewCount(video.viewCount)}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-4 pt-0 gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={openExternalVideo}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Watch on YouTube</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={cn(
                      "rounded-full", 
                      isBookmarked && "bg-primary/10 text-primary border-primary"
                    )}
                    onClick={handleBookmark}
                  >
                    <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isBookmarked ? "Remove bookmark" : "Bookmark video"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share video</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              variant="default"
              size="sm"
              className="ml-auto rounded-full"
              onClick={openVideo}
            >
              Watch Now
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      
      {/* In-App Video Player */}
      <VideoPlayer
        video={video}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        onNext={onNextVideo}
        onPrevious={onPreviousVideo}
        relatedVideos={relatedVideos}
      />
    </>
  );
} 