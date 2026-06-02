const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// ── Manifest ──────────────────────────────────────────────
app.get('/manifest.json', (req, res) => {
  res.json({
    id: "org.snakeeyes.addon",
    version: "1.2.0",
    name: "Snakeeyes",
    description: "Snakeeyes addon for streams",
    logo: "https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/logo.png",
    resources: ["stream", "catalog"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: [
      { id: "snakeeyes_movies", type: "movie", name: "Snakeeyes Movies" },
      { id: "snakeeyes_series", type: "series", name: "Snakeeyes Series" }
    ]
  });
});

// ── Catalog ───────────────────────────────────────────────
app.get('/catalog/:type/:id.json', async (req, res) => {
  try {
    const { type } = req.params;
    const response = await fetch('https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/catalog.json');
    const data = await response.json();
    const items = data[type === 'movie' ? 'movies' : 'series'] || [];
    res.json({ metas: items });
  } catch (error) {
    console.error('Catalog error:', error);
    res.json({ metas: [] });
  }
});

// ── Streams ───────────────────────────────────────────────
app.get('/stream/:type/:id.json', async (req, res) => {
  try {
    const { type, id } = req.params;

    // Series ID format: tt1234567:season:episode
    const parts = id.split(':');
    const imdbId  = parts[0];
    const season  = parts[1] || '1';
    const episode = parts[2] || '1';

    const response = await fetch('https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/sources.json');
    const data = await response.json();
    const sources = data[type === 'movie' ? 'movies' : 'series'] || [];

    const streams = sources.map(source => {
      const url = source.url
        .replace('{imdb}', imdbId)
        .replace('{s}', season)
        .replace('{e}', episode);

      return {
        name: source.name,
        title: source.title || source.name,
        externalUrl: url,        // Opens in browser — no url field so Stremio won't try to play it
        behaviorHints: {
          notWebReady: true,
          bingeGroup: source.name
        }
      };
    });

    res.json({ streams });
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ streams: [], error: error.message });
  }
});

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Snakeeyes addon running on http://localhost:${PORT}`);
});
