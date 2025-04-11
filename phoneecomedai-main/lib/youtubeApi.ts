export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
}

export interface YouTubeApiResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
}

const API_KEY = 'AIzaSyCKZvQBqIJPzQbT9jo4w2Huzp5V7z715QU';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Search terms for health-related videos
const HEALTH_VIDEO_SEARCH_TERMS = [
  'health tips',
  'medical advice',
  'doctor explanations',
  'wellness tips',
  'healthcare innovations'
];

// Search terms for health-related courses
const HEALTH_COURSE_SEARCH_TERMS = [
  'medical courses',
  'health education',
  'medical training',
  'healthcare courses',
  'nursing education',
  'first aid training',
  'medical school lectures'
];

/**
 * Fetches health videos from YouTube
 */
export async function fetchHealthVideos(
  pageToken?: string,
  maxResults: number = 10
): Promise<YouTubeApiResponse> {
  const searchTerm = HEALTH_VIDEO_SEARCH_TERMS[Math.floor(Math.random() * HEALTH_VIDEO_SEARCH_TERMS.length)];
  return fetchYouTubeVideos(searchTerm, pageToken, maxResults);
}

/**
 * Fetches health courses from YouTube
 */
export async function fetchHealthCourses(
  pageToken?: string,
  maxResults: number = 10
): Promise<YouTubeApiResponse> {
  const searchTerm = HEALTH_COURSE_SEARCH_TERMS[Math.floor(Math.random() * HEALTH_COURSE_SEARCH_TERMS.length)];
  return fetchYouTubeVideos(searchTerm, pageToken, maxResults);
}

/**
 * Fetches videos for a specific health topic
 */
export async function fetchVideosByTopic(
  topic: string,
  pageToken?: string,
  maxResults: number = 10
): Promise<YouTubeApiResponse> {
  return fetchYouTubeVideos(topic, pageToken, maxResults);
}

/**
 * Core function to fetch YouTube videos 
 */
async function fetchYouTubeVideos(
  searchQuery: string,
  pageToken?: string,
  maxResults: number = 10
): Promise<YouTubeApiResponse> {
  try {
    // Build search URL with parameters
    let searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&type=video&key=${API_KEY}`;
    
    if (pageToken) {
      searchUrl += `&pageToken=${pageToken}`;
    }

    // Fetch search results
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`YouTube API search error: ${searchResponse.statusText}`);
    }
    
    const searchData = await searchResponse.json();
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Get additional video details
    const videoDetailsUrl = `${BASE_URL}/videos?part=snippet,statistics&id=${videoIds}&key=${API_KEY}`;
    const videoDetailsResponse = await fetch(videoDetailsUrl);
    
    if (!videoDetailsResponse.ok) {
      throw new Error(`YouTube API video details error: ${videoDetailsResponse.statusText}`);
    }
    
    const videoDetailsData = await videoDetailsResponse.json();
    
    // Transform the data
    const videos = videoDetailsData.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics.viewCount,
    }));

    return {
      videos,
      nextPageToken: searchData.nextPageToken,
      prevPageToken: searchData.prevPageToken
    };
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return { videos: [] };
  }
} 