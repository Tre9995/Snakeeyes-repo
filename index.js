const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 7000;

// ============================================================
// MANIFEST
// ============================================================
const MANIFEST = {
  id: 'community.snakeeyes.movies',
  version: '1.3.0',
  name: 'Snakeeyes - Movies & TV Shows',
  description: 'Movies and TV shows from multiple embed sources. Enter your TMDB API key to unlock extra sources.',
  types: ['movie', 'series'],
  resources: [
    { name: 'stream', types: ['movie', 'series'], idPrefixes: ['tt'] }
  ],
  catalogs: [],
  logo: 'https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/logo.png',
  background: 'https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/background.png',
  behaviorHints: {
    configurable: true,
    configurationRequired: false
  }
};

// ============================================================
// CONFIGURE PAGE  (served as HTML)
// ============================================================
const CONFIGURE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Snakeeyes – Configure</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0a0a0a;
      color: #eee;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .card {
      background: #141414;
      border: 1px solid #2a2a2a;
      border-radius: 16px;
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 0 60px rgba(229,160,13,0.08);
    }
    .logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 2.4rem;
      color: #e5a00d;
      letter-spacing: 2px;
      margin-bottom: 0.2rem;
    }
    .subtitle {
      font-size: 0.82rem;
      color: #666;
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #e5a00d;
      margin-bottom: 1.2rem;
    }
    .field { margin-bottom: 1.2rem; }
    label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      color: #999;
      margin-bottom: 0.4rem;
    }
    label a {
      color: #e5a00d;
      text-decoration: none;
      font-size: 0.75rem;
    }
    label a:hover { text-decoration: underline; }
    input {
      width: 100%;
      padding: 0.65rem 0.9rem;
      background: #1e1e1e;
      border: 1px solid #2e2e2e;
      border-radius: 8px;
      color: #fff;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s;
    }
    input:focus { outline: none; border-color: #e5a00d; }
    input::placeholder { color: #444; }
    .divider { border: none; border-top: 1px solid #1e1e1e; margin: 1.5rem 0; }
    .free-note {
      font-size: 0.8rem;
      color: #555;
      background: #1a1a1a;
      border-radius: 8px;
      padding: 0.8rem 1rem;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .free-note span { color: #e5a00d; }
    button {
      width: 100%;
      padding: 0.85rem;
      background: #e5a00d;
      color: #111;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      letter-spacing: 0.3px;
    }
    button:hover { background: #f0b429; }
    button:active { transform: scale(0.98); }
    .privacy {
      font-size: 0.72rem;
      color: #444;
      text-align: center;
      margin-top: 1rem;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">🐍 Snakeeyes</div>
    <div class="subtitle">Movies &amp; TV Shows Addon for Stremio</div>

    <div class="free-note">
      <span>No key needed</span> for VidSrc, 2Embed, NontonGo, EmbedMaster, SuperEmbed, AutoEmbed &amp; MoviesAPI.<br/>
      Add a <span>TMDB key</span> to also unlock VidLink, Videasy, VidBinge, EzVidApi, Embed.su, Smashystream &amp; more.
    </div>

    <div class="section-title">API Keys (Optional)</div>

    <div class="field">
      <label>
        TMDB API Key
        <a href="https://www.themoviedb.org/settings/api" target="_blank">Get free key →</a>
      </label>
      <input type="text" id="tmdb" placeholder="e.g. a1b2c3d4e5f67890abcdef..."/>
    </div>

    <div class="field">
      <label>
        OMDb API Key
        <a href="http://www.omdbapi.com/apikey.aspx" target="_blank">Get free key →</a>
      </label>
      <input type="text" id="omdb" placeholder="e.g. abc12345"/>
    </div>

    <button onclick="install()">Install in Stremio</button>
    <p class="privacy">Your keys are embedded in your personal install URL only — never stored on any server.</p>
  </div>

  <script>
    function install() {
      const tmdb = document.getElementById('tmdb').value.trim() || 'none';
      const omdb = document.getElementById('omdb').value.trim() || 'none';
      const base = window.location.origin;
      const manifest = base + '/' + tmdb + '/' + omdb + '/manifest.json';
      const stremioUrl = 'stremio://' + manifest.replace(/^https?:\\/\\//, '');
      window.location.href = stremioUrl;
    }
  </script>
</body>
</html>`;

// ============================================================
// TMDB LOOKUP  — converts IMDb ID → TMDB ID
// ============================================================
async function toTmdbId(imdbId, type, tmdbKey) {
  if (!tmdbKey || tmdbKey === 'none') return null;
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${tmdbKey}&external_source=imdb_id`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = type === 'movie' ? data.movie_results : data.tv_results;
    return results && results.length > 0 ? String(results[0].id) : null;
  } catch (e) {
    console.error('toTmdbId error:', e.message);
    return null;
  }
}

// ============================================================
// MOVIE STREAMS
// ============================================================
async function movieStreams(imdbId, tmdbKey) {
  // --- Free sources (IMDb ID only) ---
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
      title: '▶ VidSrc.cc',
      externalUrl: `https://vidsrc.cc/v2/embed/movie/${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ 2Embed',
      externalUrl: `https://www.2embed.stream/embed/movie/${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ NontonGo',
      externalUrl: `https://www.nontongo.win/embed/movie/${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ EmbedMaster',
      externalUrl: `https://embedmaster.com/embed/movie/${imdbId}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ SuperEmbed',
      externalUrl: `https://multiembed.mov/?video_id=${imdbId}&tmdb=0`
    },
    // AutoEmbed — works with IMDb ID directly
    {
      name: 'Snakeeyes',
      title: '▶ AutoEmbed',
      externalUrl: `https://autoembed.cc/movie/imdb/${imdbId}`
    },
    // MoviesAPI — works with IMDb ID directly
    {
      name: 'Snakeeyes',
      title: '▶ MoviesAPI',
      externalUrl: `https://moviesapi.club/movie/${imdbId}`
    },
    // 111Movies — works with IMDb ID directly
    {
      name: 'Snakeeyes',
      title: '▶ 111Movies',
      externalUrl: `https://111movies.com/movie/${imdbId}`
    }
  ];

  // --- TMDB-keyed sources ---
  const tmdbId = await toTmdbId(imdbId, 'movie', tmdbKey);
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
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Embed.su',
      externalUrl: `https://embed.su/embed/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Smashystream',
      externalUrl: `https://player.smashy.stream/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Iosmirror',
      externalUrl: `https://iosmirror.cc/movie/${tmdbId}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ AkwamEmbed',
      externalUrl: `https://akwam.io/watch/movie/${tmdbId}`
    });
  }

  return streams;
}

// ============================================================
// SERIES STREAMS
// ============================================================
async function seriesStreams(imdbId, season, episode, tmdbKey) {
  const s = season || 1;
  const e = episode || 1;

  // --- Free sources (IMDb ID only) ---
  const streams = [
    {
      name: 'Snakeeyes',
      title: '▶ VidSrc',
      externalUrl: `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${s}&episode=${e}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ VidSrc.to',
      externalUrl: `https://vidsrc.to/embed/tv/${imdbId}/${s}/${e}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ VidSrc.net',
      externalUrl: `https://vidsrc.net/embed/tv?imdb=${imdbId}&season=${s}&episode=${e}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ VidSrc.cc',
      externalUrl: `https://vidsrc.cc/v2/embed/tv/${imdbId}/${s}/${e}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ 2Embed',
      externalUrl: `https://www.2embed.stream/embedtv/${imdbId}&s=${s}&e=${e}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ NontonGo',
      externalUrl: `https://www.nontongo.win/embed/tv/${imdbId}/${s}/${e}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ EmbedMaster',
      externalUrl: `https://embedmaster.com/embed/tv/${imdbId}/${s}/${e}`
    },
    {
      name: 'Snakeeyes',
      title: '▶ SuperEmbed',
      externalUrl: `https://multiembed.mov/?video_id=${imdbId}&tmdb=0&s=${s}&e=${e}`
    },
    // AutoEmbed — works with IMDb ID directly
    {
      name: 'Snakeeyes',
      title: '▶ AutoEmbed',
      externalUrl: `https://autoembed.cc/tv/imdb/${imdbId}-${s}-${e}`
    },
    // MoviesAPI — works with IMDb ID directly
    {
      name: 'Snakeeyes',
      title: '▶ MoviesAPI',
      externalUrl: `https://moviesapi.club/tv/${imdbId}-${s}-${e}`
    },
    // 111Movies — works with IMDb ID directly
    {
      name: 'Snakeeyes',
      title: '▶ 111Movies',
      externalUrl: `https://111movies.com/tv/${imdbId}/${s}/${e}`
    }
  ];

  // --- TMDB-keyed sources ---
  const tmdbId = await toTmdbId(imdbId, 'tv', tmdbKey);
  if (tmdbId) {
    streams.push({
      name: 'Snakeeyes',
      title: '▶ VidLink',
      externalUrl: `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Videasy',
      externalUrl: `https://player.videasy.net/tv/${tmdbId}/${s}/${e}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ VidBinge',
      externalUrl: `https://vidbinge.dev/embed/tv/${tmdbId}/${s}/${e}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ EzVidApi',
      externalUrl: `https://ezvidapi.com/embed/tv/${tmdbId}/${s}/${e}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ SuperEmbed HD',
      externalUrl: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Embed.su',
      externalUrl: `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Smashystream',
      externalUrl: `https://player.smashy.stream/tv/${tmdbId}?s=${s}&e=${e}`
    });
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Iosmirror',
      externalUrl: `https://iosmirror.cc/tv/${tmdbId}/${s}/${e}`
    });
  }

  return streams;
}

// ============================================================
// ROUTES
// ============================================================

// --- Configure page (no keys yet) ---
app.get('/', (req, res) => res.redirect('/configure'));
app.get('/configure', (req, res) => res.send(CONFIGURE_HTML));

// --- Configure page (already has keys in URL, re-configure) ---
app.get('/:tmdbKey/:omdbKey/configure', (req, res) => res.send(CONFIGURE_HTML));

// --- Manifest (no keys — free sources only) ---
app.get('/manifest.json', (req, res) => res.json(MANIFEST));

// --- Manifest (with keys) ---
app.get('/:tmdbKey/:omdbKey/manifest.json', (req, res) => res.json(MANIFEST));

// --- Streams (no keys — free sources only) ---
app.get('/stream/:type/:id.json', async (req, res) => {
  try {
    const { type, id } = req.params;
    const parts = id.split(':');
    const imdbId = parts[0];

    let streams = [];
    if (type === 'movie') {
      streams = await movieStreams(imdbId, null);
    } else if (type === 'series') {
      streams = await seriesStreams(imdbId, parts[1], parts[2], null);
    }

    res.json({ streams });
  } catch (err) {
    console.error('Stream error:', err.message);
    res.json({ streams: [] });
  }
});

// --- Streams (with TMDB key — all sources) ---
app.get('/:tmdbKey/:omdbKey/stream/:type/:id.json', async (req, res) => {
  try {
    const { tmdbKey, type, id } = req.params;
    const parts = id.split(':');
    const imdbId = parts[0];

    let streams = [];
    if (type === 'movie') {
      streams = await movieStreams(imdbId, tmdbKey);
    } else if (type === 'series') {
      streams = await seriesStreams(imdbId, parts[1], parts[2], tmdbKey);
    }

    res.json({ streams });
  } catch (err) {
    console.error('Stream error:', err.message);
    res.json({ streams: [] });
  }
});

// ============================================================
// START
// ============================================================
app.listen(PORT, () => {
  console.log(`\n🐍 Snakeeyes addon running on port ${PORT}`);
  console.log(`   Configure page : http://localhost:${PORT}/configure`);
  console.log(`   Manifest (free): http://localhost:${PORT}/manifest.json`);
  console.log(`   Manifest (keys): http://localhost:${PORT}/YOUR_TMDB_KEY/none/manifest.json\n`);
});
