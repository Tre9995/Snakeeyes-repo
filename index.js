const axios = require('axios');

// API Keys - Add your own keys from TMDB and OMDb
const CONFIG = {
  tmdbApiKey: 'YOUR_TMDB_API_KEY', // Get from https://www.themoviedb.org/settings/api
  omdbApiKey: 'YOUR_OMDB_API_KEY',  // Get from http://www.omdbapi.com/apikey.aspx
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  omdbBaseUrl: 'http://www.omdbapi.com'
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
    url: 'http://www.omdbapi.com',
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

// TMDB API handler
async function getTMDBStreams(id, type) {
  try {
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `${CONFIG.tmdbBaseUrl}/${endpoint}/${id}`,
      {
        params: {
          api_key: CONFIG.tmdbApiKey,
          append_to_response: 'external_ids,watch_providers'
        }
      }
    );

    const data = response.data;
    const streams = [];

    // Add TMDB link
    streams.push({
      title: `📺 ${data.title || data.name} - TMDB Info`,
      url: `https://www.themoviedb.org/${endpoint}/${id}`,
      behaviorHints: { notWebReady: false }
    });

    // Add watch provider links if available
    if (data.watch_providers && data.watch_providers.results) {
      const providers = data.watch_providers.results;
      for (const [country, info] of Object.entries(providers)) {
        if (info.flatrate) {
          info.flatrate.forEach(provider => {
            streams.push({
              title: `🎬 Watch on ${provider.provider_name}`,
              url: `https://www.themoviedb.org/${endpoint}/${id}/watch`,
              behaviorHints: { notWebReady: false }
            });
          });
        }
      }
    }

    return streams;
  } catch (error) {
    console.error('TMDB API error:', error.message);
    return [];
  }
}

// OMDb API handler
async function getOMDBStreams(imdbId, type) {
  try {
    const response = await axios.get(CONFIG.omdbBaseUrl, {
      params: {
        apikey: CONFIG.omdbApiKey,
        i: imdbId,
        type: type === 'movie' ? 'movie' : 'series',
        plot: 'full'
      }
    });

    const data = response.data;
    const streams = [];

    if (data.Response === 'True') {
      // Add OMDb link
      streams.push({
        title: `📖 ${data.Title} - OMDb Database`,
        url: `https://www.imdb.com/title/${imdbId}`,
        behaviorHints: { notWebReady: false }
      });

      // Add IMDb link
      streams.push({
        title: `⭐ View on IMDb`,
        url: `https://www.imdb.com/title/${imdbId}`,
        behaviorHints: { notWebReady: false }
      });
    }

    return streams;
  } catch (error) {
    console.error('OMDb API error:', error.message);
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
      title: '📺 Watch on Tubi TV',
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

    // Try to get streams from registered plugins first
    const pluginStreams = await pluginManager.getStreamsFromPlugins(type, id);
    if (pluginStreams.length > 0) {
      streams.push(...pluginStreams);
    }

    // Add TMDB streams
    if (CONFIG.tmdbApiKey !== 'YOUR_TMDB_API_KEY') {
      const tmdbStreams = await getTMDBStreams(id, type);
      streams.push(...tmdbStreams);
    }

    // Add OMDb streams (if IMDb ID is available)
    if (CONFIG.omdbApiKey !== 'YOUR_OMDB_API_KEY' && id.startsWith('tt')) {
      const omdbStreams = await getOMDBStreams(id, type);
      streams.push(...omdbStreams);
    }

    // Add legal free sources
    if (streams.length === 0) {
      streams = getLegalStreams(type, id);
    } else {
      // Append legal sources as fallback options
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
    if (CONFIG.tmdbApiKey !== 'YOUR_TMDB_API_KEY') {
      const response = await axios.get(
        `${CONFIG.tmdbBaseUrl}/${type === 'movie' ? 'movie' : 'tv'}/${id}`,
        {
          params: {
            api_key: CONFIG.tmdbApiKey
          }
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
    } else {
      res.json({ meta: null });
    }
  } catch (error) {
    console.error('Meta handler error:', error);
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
