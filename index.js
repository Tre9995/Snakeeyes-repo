const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const CONFIG = {
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  omdbApiKey: process.env.OMDB_API_KEY || '',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  omdbBaseUrl: 'https://www.omdbapi.com',
  port: process.env.PORT || 7000
};

const MANIFEST = {
  id: 'community.snakeeyes.movies',
  version: '1.1.0',
  name: 'Snakeeyes - Movies & TV Shows',
  description: 'Movies and TV Shows addon with TMDB, OMDb and free streaming sources.',
  types: ['movie', 'series'],
  resources: [
    { name: 'stream', types: ['movie', 'series'], idPrefixes: ['tt'] },
    { name: 'catalog', types: ['movie', 'series'] }
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

async function getTMDBStreams(imdbId, type) {
  if (!CONFIG.tmdbApiKey) return [];
  try {
    const findRes = await axios.get(`${CONFIG.tmdbBaseUrl}/find/${imdbId}`, {
      params: { api_key: CONFIG.tmdbApiKey, external_source: 'imdb_id' },
      timeout: 5000
    });
    const results = type === 'movie'
      ? findRes.data.movie_results
      : findRes.data.tv_results;
    if (!results || results.length === 0) return [];

    const tmdbId = results[0].id;
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const title = results[0].title || results[0].name || '';

    const detailRes = await axios.get(`${CONFIG.tmdbBaseUrl}/${endpoint}/${tmdbId}`, {
      params: { api_key: CONFIG.tmdbApiKey, append_to_response: 'watch/providers' },
      timeout: 5000
    });

    const streams = [];
    streams.push({
      name: 'Snakeeyes',
      title: `📺 ${title}\nView on TMDB`,
      externalUrl: `https://www.themoviedb.org/${endpoint}/${tmdbId}`
    });

    const providers = detailRes.data['watch/providers']?.results;
    if (providers && Object.keys(providers).length > 0) {
      streams.push({
        name: 'Snakeeyes',
        title: `🎬 ${title}\nLegal streaming options (TMDB)`,
        externalUrl: `https://www.themoviedb.org/${endpoint}/${tmdbId}/watch`
      });
    }

    return streams;
  } catch (e) {
    console.error('TMDB error:', e.message);
    return [];
  }
}

async function getOMDBStreams(imdbId, type) {
  if (!CONFIG.omdbApiKey) return [];
  try {
    const res = await axios.get(CONFIG.omdbBaseUrl, {
      params: {
        apikey: CONFIG.omdbApiKey,
        i: imdbId,
        type: type === 'movie' ? 'movie' : 'series'
      },
      timeout: 5000
    });
    if (res.data.Response !== 'True') return [];
    const { Title, imdbRating } = res.data;
    return [
      {
        name: 'Snakeeyes',
        title: `⭐ ${Title}\nIMDb Rating: ${imdbRating}\nView on IMDb`,
        externalUrl: `https://www.imdb.com/title/${imdbId}`
      }
    ];
  } catch (e) {
    console.error('OMDb error:', e.message);
    return [];
  }
}

function getFreeStreams(imdbId, type, title) {
  const q = encodeURIComponent((title || imdbId) + ' ' + type);
  return [
    {
      name: 'Snakeeyes',
      title: '📺 Tubi TV\nFree streaming',
      externalUrl: `https://tubitv.com/search/${encodeURIComponent(title || imdbId)}`
    },
    {
      name: 'Snakeeyes',
      title: '▶️ YouTube\nFree movies',
      externalUrl: `https://www.youtube.com/results?search_query=${q}+full+free`
    },
    {
      name: 'Snakeeyes',
      title: '🎞️ Public Domain Movies\nFree & legal',
      externalUrl: 'https://publicdomainmovies.info'
    }
  ];
}

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
  console.log(`Stream request: ${type} / ${id}`);

  const streams = [];

  if (id.startsWith('tt')) {
    const [tmdb, omdb] = await Promise.all([
      getTMDBStreams(id, type),
      getOMDBStreams(id, type)
    ]);
    streams.push(...tmdb, ...omdb);
  }

  streams.push(...getFreeStreams(id, type));

  res.json({ streams });
});

app.listen(CONFIG.port, () => {
  console.log(`✅ Snakeeyes addon running on port ${CONFIG.port}`);
  console.log(`📋 Manifest: http://localhost:${CONFIG.port}/manifest.json`);
  console.log(`🔑 TMDB key: ${CONFIG.tmdbApiKey ? '✅ configured' : '❌ missing'}`);
  console.log(`🔑 OMDb key: ${CONFIG.omdbApiKey ? '✅ configured' : '❌ missing'}`);
});
