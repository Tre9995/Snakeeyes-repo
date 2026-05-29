
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 7000;
const TMDB_TOKEN = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const MANIFEST = {
  id: 'community.snakeeyes.movies',
  version: '3.1.0',
  name: 'Snakeeyes - Movies & TV Shows',
  description: 'Stream movies and TV shows via VidSrc, VidLink and Videasy.',
  types: ['movie', 'series'],
  resources: [
    { name: 'stream', types: ['movie', 'series'], idPrefixes: ['tt'] }
  ],
  catalogs: [
    { type: 'movie', id: 'snakeeyes-movies', name: 'Snakeeyes Movies' },
    { type: 'series', id: 'snakeeyes-series', name: 'Snakeeyes Series' }
  ],
  logo: 'https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/logo.png',
  background: 'https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/background.png',
  contactEmail: 'support@snakeeyes.addon',
  behaviorHints: { configurable: false }
};

// Convert IMDb ID to TMDB ID using Bearer token (v4 auth)
async function toTmdbId(imdbId, type) {
  if (!TMDB_TOKEN) return null;
  try {
    const res = await axios.get(`${TMDB_BASE}/find/${imdbId}`, {
      params: { external_source: 'imdb_id' },
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
      timeout: 5000
    });
    const results = type === 'movie'
      ? res.data.movie_results
      : res.data.tv_results;
    return results && results.length > 0 ? results[0].id : null;
  } catch (e) {
    console.error('TMDB lookup failed:', e.message);
    return null;
  }
}

// Helper to build a stream object
function makeStream(name, title, url) {
  return {
    name,
    title,
    url,
    behaviorHints: {
      notWebReady: true,
      bingeGroup: 'snakeeyes'
    }
  };
}

// Movie streams
async function movieStreams(imdbId) {
  const streams = [
    makeStream('VidSrc', '▶ Watch on VidSrc', `https://vidsrc.me/embed/movie?imdb=${imdbId}`),
    makeStream('VidSrc Mirror', '▶ Watch on VidSrc Mirror', `https://vidsrc.cc/v2/embed/movie/${imdbId}`)
  ];

  const tmdbId = await toTmdbId(imdbId, 'movie');
  if (tmdbId) {
    console.log(`✅ TMDB ID found: ${tmdbId}`);
    streams.push(makeStream('VidLink', '▶ Watch on VidLink', `https://vidlink.pro/movie/${tmdbId}`));
    streams.push(makeStream('Videasy', '▶ Watch on Videasy', `https://player.videasy.net/movie/${tmdbId}`));
  } else {
    console.warn(`⚠️ No TMDB ID for ${imdbId} — VidLink/Videasy skipped`);
  }

  return streams;
}

// Series streams
async function seriesStreams(fullId) {
  const [imdbId, season = '1', episode = '1'] = fullId.split(':');

  const streams = [
    makeStream('VidSrc', `▶ VidSrc S${season}E${episode}`, `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`),
    makeStream('VidSrc Mirror', `▶ VidSrc Mirror S${season}E${episode}`, `https://vidsrc.cc/v2/embed/tv/${imdbId}/${season}/${episode}`)
  ];

  const tmdbId = await toTmdbId(imdbId, 'series');
  if (tmdbId) {
    console.log(`✅ TMDB ID found: ${tmdbId}`);
    streams.push(makeStream('VidLink', `▶ VidLink S${season}E${episode}`, `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`));
    streams.push(makeStream('Videasy', `▶ Videasy S${season}E${episode}`, `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`));
  } else {
    console.warn(`⚠️ No TMDB ID for ${imdbId} — VidLink/Videasy skipped`);
  }

  return streams;
}

// Routes
app.get('/', (req, res) => res.redirect('/manifest.json'));

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(MANIFEST);
});

app.get('/catalog/:type/:id.json', (req, res) => {
  res.json({ metas: [] });
});

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  console.log(`🎬 Stream request: ${type} / ${id}`);

  try {
    const streams = type === 'movie'
      ? await movieStreams(id)
      : await seriesStreams(id);

    console.log(`✅ ${streams.length} streams for ${id}`);
    res.json({ streams });
  } catch (e) {
    console.error('Stream error:', e.message);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Snakeeyes running on port ${PORT}`);
  console.log(`📋 Manifest: http://localhost:${PORT}/manifest.json`);
  console.log(`🔑 TMDB token: ${TMDB_TOKEN ? '✅ set' : '❌ missing — only VidSrc will work'}`);
});
