async function getStreamsFromGitHub(type, imdbId, tmdbId, s, e) {
  // 1. Fetch the remote file from your repo
  const response = await fetch('https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/sources.json');
  const data = await response.json();
  
  // 2. Select the right category (movies or series)
  const sources = data[type === 'movie' ? 'movies' : 'series'];
  
  // 3. Generate the links by replacing the placeholders
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
