const express = require('express');
const app = express();

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

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  
  // FOR MOVIES - just use the ID as-is
  let imdbId = id;
  let season = '';
  let episode = '';
  
  // FOR SERIES - parse season/episode if present
  const match = id.match(/^tt(d+)/(d+)/(d+)$/);
  if (match) {
    imdbId = 'tt' + match[1];
    season = match[2];
    episode = match[3];
  }
  
  try {
    const streams = await getStreamsFromGitHub(type, imdbId, null, season, episode);
    res.json({ streams });
  } catch (error) {
    res.json({ streams: [] });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT);
