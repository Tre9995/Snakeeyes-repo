async function movieStreams(imdbId) {
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
      title: '▶ 2Embed',
      externalUrl: `https://www.2embed.stream/embed/movie/${imdbId}`
    },
    // ✅ NEW: Replaces SmashyStream
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
    }
  ];

  const tmdbId = await toTmdbId(imdbId, 'movie');
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
    // ✅ NEW: embed.su (TMDB-based, confirmed working)
    streams.push({
      name: 'Snakeeyes',
      title: '▶ Embed.su',
      externalUrl: `https://embed.su/embed/movie/${tmdbId}`
    });
  }

  return streams;
    }
