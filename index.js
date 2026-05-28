const axios = require('axios');

// API Keys - Add your own keys from TMDB and OMDb
const CONFIG = {
  tmdbApiKey: process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY',
  omdbApiKey: process.env.OMDB_API_KEY || 'YOUR_OMDB_API_KEY',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  omdbBaseUrl: 'https://www.omdbapi.com'
};

// Legal streaming sources
const sources = {
  tmdb: {
    name: 'TMDB - Movie Database',
    url: 'https://www.themoviedb.org',
    type: 'both',
    apiUrl: CONFIG.tmdbBaseUrl
  },
  omdb: {
    name: 'OMDb - Open Movie Database',
    url: 'https://www.omdbapi.com',
    type: 'both',
    apiUrl: CONFIG.omdbBaseUrl
  },
  youtube: {
    name: 'YouTube - Free Movies',
    url: 'https://www.youtube.com',
    type: 'both'
  },
  tubi: {
    name: 'Tubi TV - Free Streaming',
    url: 'https://tubitv.com',
    type: 'both'
  },
  publicdomain: {
    name: 'Public Domain Movies',
    url: 'https://publicdomainmovies.info',
    type: 'movies'
  }
};

// Plugin system for extensibility
const pluginManager = {
  plugins: [],
  
  registerPlugin(plugin) {
    if (plugin.name && plugin.getStreams) {
      this.plugins.push(plugin);
      console.log(`Plugin registered: ${plugin.name}`);
      return true;
    }
    return false;
  },
  
  async getStreamsFromPlugins(type, id) {
    const streams = [];
    for (const plugin of this.plugins) {
      try {
        const pluginStreams = await plugin.getStreams(type, id);
        if (pluginStreams && pluginStreams.length > 0) {
          streams.push(...pluginStreams);
        }
      } catch (error) {
        console.error(`Plugin ${plugin.name} failed:`, error.message);
      }
    }
    return streams;
  }
};

// Helper: Convert IMDb ID to numeric ID for TMDB
function extractIMDbId(id) {
  if (id.startsWith('tt')) {
    return id;
  }
  return id;
}

// Helper: Extract numeric part from IMDb ID
function getNumericId(imdbId) {
  const match = imdbId.match(/(\d+)/);
  return match ? match[1] : imdbId;
}

// TMDB API handler
async function getTMDBStreams(id, type) {
  try {
    // Validate API key is configured
    if (CONFIG.tmdbApiKey === 'YOUR_TMDB_API_KEY') {
      console.warn('⚠️ TMDB API key not configured. Skipping TMDB streams.');
      return [];
    }

    const imdbId = extractIMDbId(id);
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    
    // TMDB requires the numeric ID or external_id lookup
    // Using external_id endpoint for IMDb ID
    let response;
    
    if (imdbId.startsWith('tt')) {
      // Look up by IMDb ID
      try {
        response = await axios.get(
          `${CONFIG.tmdbBaseUrl}/find/${imdbId}`,
          {
            params: {
              api_key: CONFIG.tmdbApiKey,
              external_source: 'imdb_id'
            },
            timeout: 5000
          }
        );

        if (!response.data.movie_results && !response.data.tv_results) {
          console.warn(`TMDB: No results found for IMDb ID ${imdbId}`);
          return [];
        }

        const tmdbId = response.data.movie_results?.[0]?.id || response.data.tv_results?.[0]?.id;
        if (!tmdbId) {
          console.warn(`TMDB: Could not extract TMDB ID for ${imdbId}`);
          return [];
        }

        // Get full details using TMDB ID
        response = await axios.get(
          `${CONFIG.tmdbBaseUrl}/${endpoint}/${tmdbId}`,
          {
            params: {
              api_key: CONFIG.tmdbApiKey,
              append_to_response: 'external_ids,watch_providers'
            },
            timeout: 5000
          }
        );
      } catch (error) {
        console.error(`TMDB lookup error for ${imdbId}:`, error.message);
        return [];
      }
    } else {
      // Use numeric ID directly
      response = await axios.get(
        `${CONFIG.tmdbBaseUrl}/${endpoint}/${id}`,
        {
          params: {
            api_key: CONFIG.tmdbApiKey,
            append_to_response: 'external_ids,watch_providers'
          },
          timeout: 5000
        }
      );
    }

    const data = response.data;
    const streams = [];

    if (!data.id) {
      console.warn(`TMDB: Invalid response for ${id}`);
      return [];
    }

    const tmdbTitle = data.title || data.name;
    const tmdbId = data.id;

    // Add TMDB link
    streams.push({
      title: `📺 ${tmdbTitle} - TMDB Info`,
      url: `https://www.themoviedb.org/${endpoint}/${tmdbId}`,
      behaviorHints: { notWebReady: false }
    });

    // Add watch provider links if available
    if (data.watch_providers && data.watch_providers.results) {
      const providers = data.watch_providers.results;
      const countryCount = Object.keys(providers).length;
      
      if (countryCount > 0) {
        streams.push({
          title: `🎬 View ${countryCount} legal streaming options (TMDB)`,
          url: `https://www.themoviedb.org/${endpoint}/${tmdbId}/watch`,
          behaviorHints: { notWebReady: false }
        });
      }
    }

    return streams;
  } catch (error) {
    console.error('TMDB API error:', error.response?.status || error.message);
    if (error.response?.status === 401) {
      console.error('❌ TMDB: Invalid API key. Check your configuration.');
    } else if (error.response?.status === 404) {
      console.error('❌ TMDB: Movie/Show not found.');
    }
    return [];
  }
}

// OMDb API handler
async function getOMDBStreams(imdbId, type) {
  try {
    // Validate API key is configured
    if (CONFIG.omdbApiKey === 'YOUR_OMDB_API_KEY') {
      console.warn('⚠️ OMDb API key not configured. Skipping OMDb streams.');
      return [];
    }

    const id = extractIMDbId(imdbId);
    
    if (!id.startsWith('tt')) {
      console.warn(`OMDb requires IMDb ID (tt format), got: ${id}`);
      return [];
    }

    const response = await axios.get(CONFIG.omdbBaseUrl, {
      params: {
        apikey: CONFIG.omdbApiKey,
        i: id,
        type: type === 'movie' ? 'movie' : 'series',
        plot: 'full'
      },
      timeout: 5000
    });

    const data = response.data;
    const streams = [];

    if (data.Response === 'True') {
      // Add OMDb link
      streams.push({
        title: `📖 ${data.Title} - OMDb Database`,
        url: `https://www.imdb.com/title/${id}`,
        behaviorHints: { notWebReady: false }
      });

      // Add IMDb link
      streams.push({
        title: `⭐ View on IMDb (${data.imdbRating} rating)`,
        url: `https://www.imdb.com/title/${id}`,
        behaviorHints: { notWebReady: false }
      });
    } else {
      console.warn(`OMDb: ${data.Error}`);
      return [];
    }

    return streams;
  } catch (error) {
    console.error('OMDb API error:', error.response?.status || error.message);
    if (error.response?.status === 401) {
      console.error('❌ OMDb: Invalid API key. Check your configuration.');
    } else if (error.response?.status === 404) {
      console.error('❌ OMDb: Movie/Show not found.');
    }
    return [];
  }
}

// Get legal streaming options
function getLegalStreams(type, id, title = '') {
  return [
    {
      title: '🌐 Search on TMDB',
      url: `https://www.themoviedb.org/search?query=${encodeURIComponent(title || id)}`,
      behaviorHints: { notWebReady: false }
    },
    {
      title: '📺 Watch on Tubi TV (Free)',
      url: 'https://tubitv.com',
      behaviorHints: { notWebReady: false }
    },
    {
      title: '📽️ YouTube Free Movies',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title || id)}+free+${type}`,
      behaviorHints: { notWebReady: false }
    },
    {
      title: '🎞️ Public Domain Movies',
      url: 'https://publicdomainmovies.info',
      behaviorHints: { notWebReady: false }
    }
  ];
}

// Main stream handler
const streamHandler = async (req, res) => {
  const type = req.params.type;
  const id = req.params.id;

  try {
    let streams = [];

    console.log(`🔍 Fetching streams for: ${type} - ${id}`);

    // Try to get streams from registered plugins first
    const pluginStreams = await pluginManager.getStreamsFromPlugins(type, id);
    if (pluginStreams.length > 0) {
      console.log(`✅ Found ${pluginStreams.length} plugin streams`);
      streams.push(...pluginStreams);
    }

    // Add TMDB streams
    const tmdbStreams = await getTMDBStreams(id, type);
    if (tmdbStreams.length > 0) {
      console.log(`✅ Found ${tmdbStreams.length} TMDB streams`);
      streams.push(...tmdbStreams);
    }

    // Add OMDb streams (if IMDb ID is available)
    if (id.startsWith('tt')) {
      const omdbStreams = await getOMDBStreams(id, type);
      if (omdbStreams.length > 0) {
        console.log(`✅ Found ${omdbStreams.length} OMDb streams`);
        streams.push(...omdbStreams);
      }
    }

    // Add legal free sources as fallback
    if (streams.length === 0) {
      console.log('⚠️ No paid sources found, adding free legal sources');
      streams = getLegalStreams(type, id);
    } else {
      // Append legal sources as additional options
      streams.push(...getLegalStreams(type, id));
    }

    res.json({ streams });
  } catch (error) {
    console.error('Stream handler error:', error);
    res.json({ streams: getLegalStreams(type, id) });
  }
};

// Catalog handler
const catalogHandler = (req, res) => {
  const type = req.params.type;
  const id = req.params.id;

  // Returns empty catalog - can be extended with TMDB data
  res.json({ metas: [] });
};

// Meta handler for additional info
const metaHandler = async (req, res) => {
  const type = req.params.type;
  const id = req.params.id;

  try {
    if (CONFIG.tmdbApiKey === 'YOUR_TMDB_API_KEY') {
      console.warn('⚠️ TMDB API key not configured. Cannot fetch metadata.');
      res.json({ meta: null });
      return;
    }

    const imdbId = extractIMDbId(id);
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    let tmdbId = id;

    // If using IMDb ID, convert to TMDB ID first
    if (imdbId.startsWith('tt')) {
      try {
        const response = await axios.get(
          `${CONFIG.tmdbBaseUrl}/find/${imdbId}`,
          {
            params: {
              api_key: CONFIG.tmdbApiKey,
              external_source: 'imdb_id'
            },
            timeout: 5000
          }
        );
        tmdbId = response.data.movie_results?.[0]?.id || response.data.tv_results?.[0]?.id;
        if (!tmdbId) {
          res.json({ meta: null });
          return;
        }
      } catch (error) {
        console.error('Error converting IMDb ID to TMDB ID:', error.message);
        res.json({ meta: null });
        return;
      }
    }

    const response = await axios.get(
      `${CONFIG.tmdbBaseUrl}/${endpoint}/${tmdbId}`,
      {
        params: {
          api_key: CONFIG.tmdbApiKey
        },
        timeout: 5000
      }
    );

    const data = response.data;
    res.json({
      meta: {
        id: id,
        type: type,
        name: data.title || data.name,
        poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        background: `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`,
        description: data.overview,
        releaseInfo: data.release_date || data.first_air_date,
        imdbRating: data.vote_average
      }
    });
  } catch (error) {
    console.error('Meta handler error:', error.response?.status || error.message);
    res.json({ meta: null });
  }
};

module.exports = {
  sources,
  pluginManager,
  streamHandler,
  catalogHandler,
  metaHandler,
  config: CONFIG
};
