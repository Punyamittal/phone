"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Youtube, 
  GraduationCap, 
  PlayCircle, 
  BookOpen, 
  Flame, 
  TrendingUp,
  Search as SearchIcon,
  RefreshCcw,
  Award,
  ChevronRight,
  Star,
  Settings,
  Subtitles,
  ListMusic,
  Sparkles
} from "lucide-react";

import { 
  fetchHealthVideos, 
  fetchHealthCourses, 
  fetchVideosByTopic,
  type YouTubeApiResponse
} from "@/lib/youtubeApi";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Health Hub components
import { SearchBar } from "@/components/health-hub/search-bar";
import { VideoGrid } from "@/components/health-hub/video-grid";
import { TopicFilter } from "@/components/health-hub/topic-filter";
import { SectionHeader } from "@/components/health-hub/section-header";

// Topic mapping to better search queries
const TOPIC_TO_SEARCH_QUERY: Record<string, string> = {
  "all": "",
  "heart-health": "heart health medical advice",
  "medications": "medication guidance healthcare",
  "mental-health": "mental health therapy techniques",
  "nutrition": "nutrition medical advice diet",
  "pediatrics": "pediatric health children medical",
  "fitness": "fitness exercise medical guidance",
  "research": "medical research breakthroughs",
  "first-aid": "first aid medical emergency training",
  "holistic": "holistic medicine natural remedies",
  "physical-therapy": "physical therapy rehabilitation techniques",
  "diagnostics": "medical diagnostics procedures",
  "vital-signs": "vital signs monitoring healthcare"
};

// Featured content for the hero section
const FEATURED_CONTENT = [
  {
    title: "Understanding COVID-19 Long-Term Effects",
    description: "Learn about the latest research on long-term effects of COVID-19 and recovery strategies.",
    image: "https://images.unsplash.com/photo-1584118624012-df056829fbd0?q=80&w=1000&auto=format&fit=crop",
    category: "Research",
    duration: "45 min"
  },
  {
    title: "Heart Health Fundamentals",
    description: "Comprehensive guide to maintaining a healthy heart through diet, exercise, and lifestyle changes.",
    image: "https://images.unsplash.com/photo-1559757175-7cb057fba93c?q=80&w=1000&auto=format&fit=crop",
    category: "Wellness",
    duration: "30 min"
  },
  {
    title: "Mental Health First Aid",
    description: "Essential techniques for identifying mental health issues and providing appropriate support.",
    image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?q=80&w=1000&auto=format&fit=crop",
    category: "Mental Health",
    duration: "60 min"
  }
];

export default function HealthHubPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const initialTab = searchParams?.get("tab") || "videos";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Function to handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Function to handle search query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Reset topic filter when searching
    setSelectedTopic("all");
  }, []);

  // Function to handle topic selection
  const handleTopicSelect = useCallback((topicId: string) => {
    setSelectedTopic(topicId);
    // Clear search query when selecting a topic
    setSearchQuery("");
  }, []);

  // Function to refresh the content
  const refreshContent = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    toast.success("Content refreshed");
  }, []);

  // Functions for fetching different types of content
  const fetchVideosWithQuery = useCallback(
    (pageToken?: string) => {
      if (searchQuery) {
        return fetchVideosByTopic(searchQuery, pageToken);
      } else if (selectedTopic !== "all") {
        const topicQuery = TOPIC_TO_SEARCH_QUERY[selectedTopic] || selectedTopic;
        return fetchVideosByTopic(topicQuery, pageToken);
      }
      return fetchHealthVideos(pageToken);
    },
    [searchQuery, selectedTopic]
  );

  const fetchCoursesWithQuery = useCallback(
    (pageToken?: string) => {
      if (searchQuery) {
        return fetchVideosByTopic(`${searchQuery} course tutorial`, pageToken);
      } else if (selectedTopic !== "all") {
        const topicQuery = TOPIC_TO_SEARCH_QUERY[selectedTopic] || selectedTopic;
        return fetchVideosByTopic(`${topicQuery} course tutorial`, pageToken);
      }
      return fetchHealthCourses(pageToken);
    },
    [searchQuery, selectedTopic]
  );
  
  // Rotate featured content
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % FEATURED_CONTENT.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Featured Content */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-black">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ 
            backgroundImage: `url(${FEATURED_CONTENT[featuredIndex].image})`, 
            filter: 'brightness(0.5) saturate(1.2)'
          }}
        />
        
        {/* Content */}
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-10">
          <motion.div
            key={featuredIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.7 }}
            className="text-center text-white max-w-3xl"
          >
            <Badge className="mb-4 bg-primary/80 hover:bg-primary text-white border-none">
              Featured Content
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
              {FEATURED_CONTENT[featuredIndex].title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6">
              {FEATURED_CONTENT[featuredIndex].description}
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Badge variant="outline" className="px-3 py-1 border-white/30 text-white">
                {FEATURED_CONTENT[featuredIndex].category}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 border-white/30 text-white">
                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                {FEATURED_CONTENT[featuredIndex].duration}
              </Badge>
            </div>
            <div className="mt-8">
              <Button className="rounded-full" size="lg">
                Watch Featured <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {/* Featured Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {FEATURED_CONTENT.map((_, index) => (
                <button
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === featuredIndex ? "bg-primary scale-125" : "bg-white/50 hover:bg-white/70"
                  }`}
                  onClick={() => setFeaturedIndex(index)}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Search Section */}
        <div className="mb-8 -mt-24 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-card shadow-xl rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Find Health Content</h2>
            <SearchBar onSearch={handleSearch} />
          </motion.div>
        </div>

        {/* Topic Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SectionHeader
            title="Browse by Topic"
            description="Explore our curated health topics for videos and courses"
            icon={<BookOpen className="h-5 w-5" />}
          />
          <TopicFilter onSelectTopic={handleTopicSelect} selectedTopic={selectedTopic} />
        </motion.div>

        {/* Active Filters */}
        {(searchQuery || selectedTopic !== "all") && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between mb-6 bg-muted/50 rounded-lg p-3"
          >
            <div className="flex items-center gap-3 flex-wrap">
              {searchQuery && (
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full text-sm">
                  <SearchIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Results for: <span className="font-medium">{searchQuery}</span></span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1 rounded-full" 
                    onClick={() => setSearchQuery("")}
                  >
                    <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                      ×
                    </motion.div>
                  </Button>
                </div>
              )}
              
              {selectedTopic !== "all" && !searchQuery && (
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Topic: <span className="font-medium">{selectedTopic.replace("-", " ")}</span></span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-1 rounded-full" 
                    onClick={() => setSelectedTopic("all")}
                  >
                    <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                      ×
                    </motion.div>
                  </Button>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1" 
              onClick={refreshContent}
            >
              <motion.div 
                whileHover={{ rotate: 180 }} 
                transition={{ duration: 0.3 }}
              >
                <RefreshCcw className="h-4 w-4" />
              </motion.div>
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </motion.div>
        )}

        {/* New Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-6 md:p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="md:w-1/2 space-y-4">
              <Badge variant="outline" className="bg-primary/30 text-primary border-primary/50">
                New Feature
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Enhanced Video Player</h2>
              <p className="text-muted-foreground">
                Experience our new interactive video player with advanced controls, playback speed adjustment, 
                quality settings, and more. Watch your favorite health content without leaving the app!
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-sm bg-background/80 px-3 py-1.5 rounded-full">
                  <Settings className="h-3.5 w-3.5" />
                  <span>Quality Control</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm bg-background/80 px-3 py-1.5 rounded-full">
                  <Subtitles className="h-3.5 w-3.5" />
                  <span>Subtitles</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm bg-background/80 px-3 py-1.5 rounded-full">
                  <ListMusic className="h-3.5 w-3.5" />
                  <span>Playlists</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm bg-background/80 px-3 py-1.5 rounded-full">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI Summaries</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 aspect-video bg-black/10 rounded-lg overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
                className="w-full h-full object-cover" 
                alt="Video player features" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer"
                >
                  <PlayCircle className="h-8 w-8 text-white" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs 
          defaultValue={activeTab} 
          onValueChange={handleTabChange}
          className="space-y-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 rounded-full p-1">
            <TabsTrigger value="videos" className="rounded-full flex items-center gap-2 py-3">
              <PlayCircle className="h-4 w-4" />
              <span>Health Videos</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="rounded-full flex items-center gap-2 py-3">
              <GraduationCap className="h-4 w-4" />
              <span>Medical Courses</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-8">
            <SectionHeader
              title="Health Videos"
              description="Learn about medical topics, treatments, and wellness tips from health professionals"
              icon={<Youtube className="h-5 w-5" />}
              actionLabel="See all videos"
              onAction={() => toast.info("View all videos clicked")}
            />
            
            <VideoGrid 
              key={`videos-${refreshKey}-${searchQuery}-${selectedTopic}`} 
              fetchVideos={fetchVideosWithQuery}
              title="Health Videos"
              emptyMessage={searchQuery ? `No videos found for "${searchQuery}"` : "No videos found for this topic"}
            />
          </TabsContent>

          <TabsContent value="courses" className="space-y-8">
            <SectionHeader
              title="Medical Courses"
              description="Comprehensive educational content on healthcare topics and medical training"
              icon={<BookOpen className="h-5 w-5" />}
              actionLabel="Browse all courses"
              onAction={() => toast.info("Browse all courses clicked")}
            />
            
            <VideoGrid 
              key={`courses-${refreshKey}-${searchQuery}-${selectedTopic}`} 
              fetchVideos={fetchCoursesWithQuery}
              title="Medical Courses"
              emptyMessage={searchQuery ? `No courses found for "${searchQuery}"` : "No courses found for this topic"}
            />
          </TabsContent>
        </Tabs>

        {/* Top Rated Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-primary/10 via-muted to-primary/5 rounded-xl p-8 mt-16"
        >
          <SectionHeader
            title="Top Rated Health Content"
            description="Highest-rated videos and courses recommended by healthcare professionals"
            icon={<Award className="h-5 w-5" />}
            className="mb-8"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-card rounded-lg overflow-hidden shadow-md"
              >
                <div className="aspect-video bg-muted relative">
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full px-2 py-1 text-xs font-medium flex items-center">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    4.{8 + index}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium truncate">Top Rated Health Content #{index}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Healthcare Academy</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="rounded-full">
              View All Top Rated <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </motion.div>

        {/* Trending Health Topics */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center space-y-6"
        >
          <SectionHeader
            title="Trending Health Topics"
            description="Popular health and medical topics people are searching for right now"
            icon={<Flame className="h-5 w-5" />}
          />

          <div className="flex flex-wrap justify-center gap-3 mt-4 max-w-3xl mx-auto">
            {Object.entries(TOPIC_TO_SEARCH_QUERY)
              .filter(([key]) => key !== "all")
              .map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => handleTopicSelect(key)}
                  >
                    {key.replace("-", " ")}
                  </Button>
                </motion.div>
              ))
            }
          </div>
        </motion.div>
        
        {/* Newsletter Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-card shadow-lg rounded-xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Stay Updated with Health Hub</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Subscribe to our newsletter to receive the latest health videos, courses, and exclusive content.
          </p>
          
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="rounded-full" onClick={() => toast.success("Subscribed to newsletter!")}>
              Subscribe
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 