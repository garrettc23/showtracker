export class ImageService {
  private tmdbApiKey: string;
  private googleApiKey: string;
  private googleSearchEngineId: string;

  constructor() {
    this.tmdbApiKey = process.env.TMDB_API_KEY || process.env.VITE_TMDB_API_KEY || "";
    this.googleApiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY || "";
    this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.VITE_GOOGLE_SEARCH_ENGINE_ID || "";
  }

  async fetchShowImage(title: string): Promise<string> {
    // Step 1: Try Google Custom Search API for images
    try {
      const googleImageUrl = await this.searchGoogleImages(title);
      if (googleImageUrl) {
        return googleImageUrl;
      }
    } catch (error) {
      console.log('Google Images search failed, trying TMDB:', error);
    }

    // Step 2: Fallback to TMDB API
    try {
      const tmdbImageUrl = await this.searchTMDB(title);
      if (tmdbImageUrl) {
        return tmdbImageUrl;
      }
    } catch (error) {
      console.log('TMDB search failed:', error);
    }

    // Step 3: Default fallback image
    return 'https://images.unsplash.com/photo-1489599734473-75adfd1b2a5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600';
  }

  private async searchGoogleImages(title: string): Promise<string | null> {
    if (!this.googleApiKey || !this.googleSearchEngineId) {
      throw new Error('Google API credentials not available');
    }

    const query = `${title} TV show poster`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${this.googleApiKey}&cx=${this.googleSearchEngineId}&q=${encodeURIComponent(query)}&searchType=image&imgType=photo&imgSize=medium&num=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].link;
    }

    return null;
  }

  private async searchTMDB(title: string): Promise<string | null> {
    if (!this.tmdbApiKey) {
      throw new Error('TMDB API key not available');
    }

    // Search for TV show
    const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${this.tmdbApiKey}&query=${encodeURIComponent(title)}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      throw new Error(`TMDB search error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    if (searchData.results && searchData.results.length > 0) {
      const posterPath = searchData.results[0].poster_path;
      if (posterPath) {
        return `https://image.tmdb.org/t/p/w500${posterPath}`;
      }
    }

    return null;
  }
}

export const imageService = new ImageService();
