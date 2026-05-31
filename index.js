async function movieStreams(imdbId, tmdbKey) {
  const tmdbId = await toTmdbId(imdbId, 'movie', tmdbKey);
  return await getStreamsFromGitHub('movie', imdbId, tmdbId);
}
