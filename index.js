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
  version: '3.2.0',
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

// Movie streams
async function movieStreams(imdbId) {
  const streams = [
    {
      name: 'Snakeeyes',
      title: '▶ Watch on VidSrc',
      externalUrl: `https://vidsrc.me/embed/movie?imdb=${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ Watch on VidSrc Mirror',
      externalUrl: `https://vidsrc.cc/v2/embed/movie/${imdbId}`
    }
  ];

  const tmdbId = await toTmdbId(imdbId, 'movie');
  if (tmdbId) {
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Watch on VidLink',
      externalUrl: `https://vidlink.pro/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Watch on Videasy',
      externalUrl: `https://player.videasy.net/movie/${tmdbId}`
    });
  }

  return streams;
}

// Series streams
async function seriesStreams(fullId) {
  const [imdbId, season = '1', episode = '1'] = fullId.split(':');

  const streams = [
    {
      name: 'Snakeeyes',
      title: `▶ VidSrc S${season}E${episode}`,
      externalUrl: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
    },
    {
      name: 'Snakeeyes',
      title: `▶ VidSrc Mirror S${season}E${episode}`,
      externalUrl: `https://vidsrc.cc/v2/embed/tv/${imdbId}/${season}/${episode}`
    }
  ];

  const tmdbId = await toTmdbId(imdbId, 'series');
  if (tmdbId) {
    streams.push({
      name: 'Snakeeyes',
      title: `▶ VidLink S${season}E${episode}`,
      externalUrl: `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: `▶ Videasy S${season}E${episode}`,
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
