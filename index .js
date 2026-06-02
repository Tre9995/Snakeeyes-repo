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

app.get('/manifest.json', (req, res) => {
  res.json({
    id: "org.snakeeyes.addon",
    version: "1.0.0",
    name: "Snakeeyes",
    description: "Snakeeyes addon for streams",
    resources: ["stream"],
    types: ["movie", "series"]
  });
});

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id } = req.params;
  
  try {
    const streams = await getStreamsFromGitHub(type, id, null, '', '');
    res.json({ streams });
  } catch (error) {
    res.json({ streams: [] });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
