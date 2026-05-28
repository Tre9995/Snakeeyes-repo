const axios = require('axios');

// Provider sources with URLs
const sources = {
  cinemacity: {
    name: 'CinemaCity',
    url: 'http://cinemacity.cc',
    type: 'both'
  },
  dooflix: {
    name: 'Dooflix',
    url: 'https://dooflixapk.com',
    type: 'both'
  },
  allmovieland: {
    name: 'AllMovieland',
    url: 'https://www.allmovieland.com',
    type: 'both'
  },
  purestream: {
    name: 'PureStream',
    url: 'https://www.purestream.tv',
    type: 'both'
  },
  moviebox: {
    name: 'MovieBox (English)',
    url: 'https://www.movieboxpro.app',
    type: 'both'
  },
  sinewix: {
    name: 'Sinewix',
    url: 'https://sinewix.com',
    type: 'both'
  },
  netmirror: {
    name: 'NetMirror',
    url: 'https://www.netmirror.online',
    type: 'both'
  }
};

// Stream handler
const streamHandler = (req, res) => {
  const type = req.params.type;
  const id = req.params.id;

  // Return available streams from providers
  const streams = [];

  Object.keys(sources).forEach(provider => {
    const source = sources[provider];
    streams.push({
      title: `${source.name} - Stream`,
      url: `${source.url}`,
      sources: [{
        url: source.url,
        quality: '1080p'
      }]
    });
  });

  res.json({ streams });
};

// Catalog handler
const catalogHandler = (req, res) => {
  const type = req.params.type;
  const id = req.params.id;

  res.json({ metas: [] });
};

module.exports = {
  sources,
  streamHandler,
  catalogHandler
};
