const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 7000;
const TMDB_TOKEN = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Simple in-memory TMDB ID cache
const tmdbCache = new Map();

const MANIFEST = {
  id: 'community.snakeeyes.movies',
  version: '3.5.0',
  name: 'Snakeeyes - Movies & TV Shows',
  description: 'Stream movies and TV shows via VidSrc, VidLink, Videasy, 2Embed, Moviesapi, EzVidApi, SuperEmbed, Autoembed and VidBinge.',
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

// ─── TMDB Lookup (with cache) ─────────────────────────────────────────────────

async function toTmdbId(imdbId, type) {
  if (!TMDB_TOKEN) return null;
  const cacheKey = `${type}:${imdbId}`;
  if (tmdbCache.has(cacheKey)) return tmdbCache.get(cacheKey);
  try {
    const res = await axios.get(`${TMDB_BASE}/find/${imdbId}`, {
      params: { external_source: 'imdb_id' },
      headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
      timeout: 5000
    });
    const results = type === 'movie' ? res.data.movie_results : res.data.tv_results;
    const tmdbId = results && results.length > 0 ? results[0].id : null;
    tmdbCache.set(cacheKey, tmdbId);
    return tmdbId;
  } catch (e) {
    console.error('TMDB lookup failed:', e.message);
    return null;
  }
}

// ─── Movie Streams ────────────────────────────────────────────────────────────

async function movieStreams(imdbId) {
  // IMDb-based — always available, no TMDB token needed
  const streams = [
    {
      name: 'Snakeeyes',
      title: '▶ VidSrc',
      externalUrl: `https://vidsrc.me/embed/movie?imdb=${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ VidSrc.to',
      externalUrl: `https://vidsrc.to/embed/movie/${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ VidSrc.net',
      externalUrl: `https://vidsrc.net/embed/movie?imdb=${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ 2Embed',
      externalUrl: `https://www.2embed.stream/embed/movie/${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ Moviesapi',
      externalUrl: `https://moviesapi.club/movie/${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ SuperEmbed',
      externalUrl: `https://multiembed.mov/?video_id=${imdbId}&tmdb=0`
    },
    {
      name: 'Snakeeyes',
      title: '▶ Autoembed',
      externalUrl: `https://player.autoembed.cc/embed/movie/${imdbId}`
    }
  ];

  // TMDB-based — higher quality, requires TMDB token
  const tmdbId = await toTmdbId(imdbId, 'movie');
  if (tmdbId) {
    streams.push({
      name: 'Snakeeyes',
      title: '▶ VidLink',
      externalUrl: `https://vidlink.pro/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Videasy',
      externalUrl: `https://player.videasy.net/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ VidBinge',
      externalUrl: `https://vidbinge.dev/embed/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ EzVidApi',
      externalUrl: `https://ezvidapi.com/embed/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ SuperEmbed HD',
      externalUrl: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
    });
  }

  return streams;
}

// ─── Series Streams ───────────────────────────────────────────────────────────

async function seriesStreams(fullId) {
  const [imdbId, season = '1', episode = '1'] = fullId.split(':');

  // IMDb-based — always available, no TMDB token needed
  const streams = [
    {
      name: 'Snakeeyes',
      title: `▶ VidSrc S${season}E${episode}`,
      externalUrl: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
    },
    {
      name: 'Snakeeyes',
      title: `▶ VidSrc.to S${season}E${episode}`,
      externalUrl: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`
    },
    {
      name: 'Snakeeyes',
      title: `▶ VidSrc.net S${season}E${episode}`,
      externalUrl: `https://vidsrc.net/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`
    },
    {
      name: 'Snakeeyes',
      title: `▶ 2Embed S${season}E${episode}`,
      externalUrl: `https://www.2embed.stream/embed/tv/${imdbId}/${season}/${episode}`
    },
    {
      name: 'Snakeeyes',
      title: `▶ Moviesapi S${season}E${episode}`,
      externalUrl: `https://moviesapi.club/tv/${imdbId}-${season}-${episode}`
    },
    {
      name: 'Snakeeyes',
      title: `▶ SuperEmbed S${season}E${episode}`,
      externalUrl: `https://multiembed.mov/?video_id=${imdbId}&tmdb=0&s=${season}&e=${episode}`
    },
    {
      name: 'Snakeeyes',
      title: `▶ Autoembed S${season}E${episode}`,
      externalUrl: `https://player.autoembed.cc/embed/tv/${imdbId}/${season}/${episode}`
    }
  ];

  // TMDB-based — higher quality, requires TMDB token
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
    streams.push({
      name: 'Snakeeyes',
      title: `▶ VidBinge S${season}E${episode}`,
      externalUrl: `https://vidbinge.dev/embed/tv/${tmdbId}/${season}/${episode}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: `▶ EzVidApi S${season}E${episode}`,
      externalUrl: `https://ezvidapi.com/embed/tv/${tmdbId}?season=${season}&episode=${episode}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: `▶ SuperEmbed HD S${season}E${episode}`,
      externalUrl: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
    });
  }

  return streams;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

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
  console.log(`🔑 TMDB token: ${TMDB_TOKEN ? '✅ set' : '❌ missing — only IMDb-based sources will work'}`);
});
