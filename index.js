const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/manifest.json', (req, res) => {
  res.json({
    id: "org.snakeeyes.addon",
    version: "1.1.0",
    name: "Snakeeyes",
    description: "Stream movies and series via multiple sources",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"]
  });
});

app.get('/stream/:type/:id.json', async (req, res) => {
  try {
    const { type, id } = req.params;

    // For series, Stremio sends: tt1234567:season:episode
    const parts = id.split(':');
    const imdbId = parts[0];
    const season  = parts[1] || '1';
    const episode = parts[2] || '1';

    const response = await fetch('https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/sources.json');
    const data = await response.json();

    const sources = data[type === 'movie' ? 'movies' : 'series'];

    const streams = sources.map(source => {
      let url = source.url
        .replace('{imdb}', imdbId)
        .replace('{s}', season)
        .replace('{e}', episode);

      return {
        name: source.name,
        title: source.title || source.name,
        url: url,
        externalUrl: url,
        behaviorHints: {
          notWebReady: true  // opens in external player
        }
      };
    });

    res.json({ streams });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ streams: [], error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Snakeeyes addon running on http://localhost:${PORT}`);
});
