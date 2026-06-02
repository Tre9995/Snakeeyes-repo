const streams = sources.map(source => ({
  name: source.name,
  title: source.name,
  url: source.url.replace('{imdb}', id),
  externalUrl: source.url.replace('{imdb}', id),  // ← Added this line
  type: "http"
}));
