return {
  name: source.name,
  title: source.title || source.name,
  url: url,
  behaviorHints: {
    notWebReady: true,
    externalUrl: url,
    bingeGroup: source.name
  }
};
