
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 7000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const MANIFEST = {
  id: 'community.snakeeyes.movies',
  version: '2.0.0',
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

// Convert IMDb ID to TMDB ID
async function toTmdbId(imdbId, type) {
  if (!TMDB_API_KEY) return null;
  try {
    const res = await axios.get(`${TMDB_BASE}/find/${imdbId}`, {
      params: { api_key: TMDB_API_KEY, external_source: 'imdb_id' },
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

// Movie streams
async function movieStreams(imdbId) {
  const streams = [
    {
      name: 'Snakeeyes | VidSrc',
      title: '▶ Watch on VidSrc',
      externalUrl: `https://vidsrc.fyi/embed/movie/${imdbId}`
    }
  ];

  const tmdbId = await toTmdbId(imdbId, 'movie');
  if (tmdbId) {
    streams.push({
      name: 'Snakeeyes | VidLink',
      title: '▶ Watch on VidLink',
      externalUrl: `https://vidlink.pro/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes | Videasy',
      title: '▶ Watch on Videasy',
      externalUrl: `https://player.videasy.net/movie/${tmdbId}`
    });
  }

  return streams;
}

// Series streams — Stremio passes id as tt1234567:season:episode
async function seriesStreams(fullId) {
  const [imdbId, season = '1', episode = '1'] = fullId.split(':');

  const streams = [
    {
      name: 'Snakeeyes | VidSrc',
      title: `▶ Watch on VidSrc  S${season}E${episode}`,
      externalUrl: `https://vidsrc.fyi/embed/tv/${imdbId}/${season}/${episode}`
    }
  ];

  const tmdbId = await toTmdbId(imdbId, 'series');
  if (tmdbId) {
    streams.push({
      name: 'Snakeeyes | VidLink',
      title: `▶ Watch on VidLink  S${season}E${episode}`,
      externalUrl: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
    });
    streams.push({
      name: 'Snakeeyes | Videasy',
      title: `▶ Watch on Videasy  S${season}E${episode}`,
      externalUrl: `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}`
    });
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

    console.log(`✅ ${streams.length} streams returned for ${id}`);
    res.json({ streams });
  } catch (e) {
    console.error('Stream error:', e.message);
    res.json({ streams: [] });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Snakeeyes running on port ${PORT}`);
  console.log(`📋 Manifest: http://localhost:${PORT}/manifest.json`);
  console.log(`🔑 TMDB key: ${TMDB_API_KEY ? '✅ set' : '❌ missing — only VidSrc will work'}`);
});
