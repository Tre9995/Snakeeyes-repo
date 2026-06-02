const express = require('express');
const app = express();

// Your existing stream function (kept unchanged)
async function getStreamsFromGitHub(type, imdbId, tmdbId, s, e) {
  const response = await fetch('https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/sources.json');
  const data = await response.json();
  
  const sources = data[type === 'movie' ? 'movies' : 'series'];
  
  return sources.map(source => ({
    name: 'Snakeeyes',
    title: `▶ ${source.name}`,
    externalUrl: source.url
      .replace('{imdb}', imdbId)
      .replace('{tmdb}', tmdbId || '')
      .replace('{s}', s)
      .replace('{e}', e)
  }));
}

// Catalog function
async function getCatalog(type, id, extra) {
  const response = await fetch('https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/sources.json');
  const data = await response.json();
  
  const sources = type === 'movie' ? data.movies : data.series;
  
  const metas = sources.slice(0, 50).map((source, index) => ({
    id: `tt${String(index).padStart(7, '0')}`,
    type: type,
    name: source.name,
    poster: source.poster || 'https://via.placeholder.com/300x450?text=Snakeeyes',
    genres: source.genres || ['Stream']
  }));
  
  return { metas };
}

// Manifest route
app.get('/manifest.json', (req, res) => {
  res.json({
    id: "org.snakeeyes.addon",
    version: "1.0.0",
    name: "Snakeeyes",
    description: "Snakeeyes addon for streams",
    logo: "https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/logo.png",
    resources: ["stream", "catalog"],
    types: ["movie", "series"],
    catalogs: [
      {
        id: "snakeeyes_movies",
        type: "movie",
        name: "Snakeeyes Movies"
      },
      {
        id: "snakeeyes_series",
        type: "series",
        name: "Snakeeyes Series"
      }
    ]
  });
});

// Catalog route
app.get('/catalog/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  const extra = req.query;
  
  try {
    const catalog = await getCatalog(type, id, extra);
    res.json(catalog);
  } catch (error) {
    res.json({ metas: [] });
  }
});

// Stream route - FIXED
app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  
  // Parse the ID properly - it could be imdbId like "tt1234567" or tmdbId
  let imdbId = id;
  let tmdbId = null;
  let season = '';
  let episode = '';
  
  // Check if it's a series with season/episode (e.g., tt1234567/1/1)
  const seriesMatch = id.match(/^(ttd+)/(d+)/(d+)$/);
  if (seriesMatch) {
    imdbId = seriesMatch[1];
    season = seriesMatch[2];
    episode = seriesMatch[3];
  } else if (id.startsWith('tt')) {
    imdbId = id;
  } else {
    tmdbId = id;
  }
  
  try {
    const streams = await getStreamsFromGitHub(type, imdbId, tmdbId, season, episode);
    res.json({ streams });
  } catch (error) {
    console.error('Stream error:', error);
    res.json({ streams: [] });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Snakeeyes addon running on port ${PORT}`));
