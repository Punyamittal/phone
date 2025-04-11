"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { VideoCard } from "./video-card";
import { type YouTubeVideo, type YouTubeApiResponse } from "@/lib/youtubeApi";

interface VideoGridProps {
  fetchVideos: (pageToken?: string) => Promise<YouTubeApiResponse>;
  title: string;
  emptyMessage?: string;
}

export function VideoGrid({ fetchVideos, title, emptyMessage = "No videos found" }: VideoGridProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [prevPageToken, setPrevPageToken] = useState<string | undefined>(undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOption, setSortOption] = useState<'relevance' | 'date' | 'viewCount'>('relevance');
  const [filterDuration, setFilterDuration] = useState<'any' | 'short' | 'medium' | 'long'>('any');

  const loadVideos = async (pageToken?: string, reset = false) => {
    try {
      setLoadingMore(!!pageToken && !reset);
      if (!pageToken) setLoading(true);
      
      const response = await fetchVideos(pageToken);
      
      // Sort videos based on the selected option
      const sortedVideos = sortVideos(response.videos, sortOption);
      
      setVideos(prev => reset ? sortedVideos : [...prev, ...sortedVideos]);
      setNextPageToken(response.nextPageToken);
      setPrevPageToken(response.prevPageToken);
      setError(null);
    } catch (err) {
      setError("Failed to load videos. Please try again.");
      console.error("Failed to load videos:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Sort videos based on the selected option
  const sortVideos = useCallback((videos: YouTubeVideo[], sortBy: 'relevance' | 'date' | 'viewCount') => {
    const videosCopy = [...videos];
    
    switch (sortBy) {
      case 'date':
        return videosCopy.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      case 'viewCount':
        return videosCopy.sort((a, b) => {
          const aCount = a.viewCount ? parseInt(a.viewCount) : 0;
          const bCount = b.viewCount ? parseInt(b.viewCount) : 0;
          return bCount - aCount;
        });
      case 'relevance':
      default:
        return videosCopy;
    }
  }, []);

  // Change sort option
  const handleSortChange = (option: 'relevance' | 'date' | 'viewCount') => {
    setSortOption(option);
    const sortedVideos = sortVideos(videos, option);
    setVideos(sortedVideos);
  };

  // Change duration filter
  const handleFilterChange = (duration: 'any' | 'short' | 'medium' | 'long') => {
    setFilterDuration(duration);
    // In a real app, you would refetch videos with the new duration filter
    // For now, we just update the state
    loadVideos(undefined, true);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleLoadMore = () => {
    if (nextPageToken) {
      loadVideos(nextPageToken);
    }
  };

  // Get related videos for a specific video
  const getRelatedVideos = (currentVideo: YouTubeVideo): YouTubeVideo[] => {
    // Exclude the current video and return some others
    return videos.filter(video => video.id !== currentVideo.id).slice(0, 5);
  };

  // Get the next and previous video for navigation
  const getNextVideo = (index: number) => {
    if (index < videos.length - 1) {
      return () => {
        // In a real app, you might want to open the next video in the player
        console.log("Navigate to next video:", videos[index + 1].title);
      };
    }
    return undefined;
  };

  const getPreviousVideo = (index: number) => {
    if (index > 0) {
      return () => {
        // In a real app, you might want to open the previous video in the player
        console.log("Navigate to previous video:", videos[index - 1].title);
      };
    }
    return undefined;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading {title.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => loadVideos(undefined, true)}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort and Filter Controls */}
      <div className="flex items-center justify-end gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort By: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort Videos</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSortChange('relevance')}>
              Relevance {sortOption === 'relevance' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('date')}>
              Upload Date {sortOption === 'date' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('viewCount')}>
              View Count {sortOption === 'viewCount' && '✓'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Duration</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFilterChange('any')}>
              Any Length {filterDuration === 'any' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('short')}>
              Short (&lt; 4 min) {filterDuration === 'short' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('medium')}>
              Medium (4-20 min) {filterDuration === 'medium' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFilterChange('long')}>
              Long (&gt; 20 min) {filterDuration === 'long' && '✓'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {videos.map((video, index) => (
          <VideoCard 
            key={`${video.id}-${index}`} 
            video={video} 
            priority={index < 4}
            relatedVideos={getRelatedVideos(video)}
            onNextVideo={getNextVideo(index)}
            onPreviousVideo={getPreviousVideo(index)}
          />
        ))}
      </motion.div>

      {nextPageToken && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleLoadMore} 
            disabled={loadingMore} 
            className="min-w-[150px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Loading
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 