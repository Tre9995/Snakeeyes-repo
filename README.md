# Snakeeyes - Movies & TV Shows Addon

A comprehensive addon for accessing movies and TV shows from multiple streaming sources with Stremio integration.

## 📺 Supported Providers

This addon includes the following streaming sources:

1. **CinemaCity** - http://cinemacity.cc
2. **Dooflix** - https://dooflixapk.com
3. **AllMovieland** - https://www.allmovieland.com
4. **PureStream** - https://www.purestream.tv
5. **MovieBox (English)** - https://www.movieboxpro.app
6. **Sinewix** - https://sinewix.com
7. **NetMirror** - https://www.netmirror.online

All providers support both Movies and TV Shows.

## 🚀 Installation

To use this addon in Stremio, add the following manifest URL:

```
https://raw.githubusercontent.com/Tre9995/Snakeeyes-repo/main/manifest.json
```

**Steps:**
1. Open Stremio
2. Go to Settings > Add-ons
3. Paste the manifest URL above
4. Click "Install"
5. Enjoy unlimited streaming!

## ⚙️ Configuration (IMPORTANT!)

Before using the addon, you **must configure API keys** for full functionality:

### Required Setup:
1. **Get TMDB API Key** - Follow [API_SETUP.md](./API_SETUP.md#-tmdb-the-movie-database-setup)
2. **Get OMDb API Key** - Follow [API_SETUP.md](./API_SETUP.md#-omdb-open-movie-database-setup)
3. **Add keys to your configuration** - See [API_SETUP.md](./API_SETUP.md#%EF%B8%8F-configuration-methods)

**Quick Start:**
```bash
export TMDB_API_KEY="your_api_key_here"
export OMDB_API_KEY="your_api_key_here"
npm start
```

⚠️ **Without API keys, the addon will:**
- Still work with free sources (Tubi, YouTube, Public Domain)
- Not display TMDB/OMDb metadata
- Not show additional legal streaming options
- See warnings in console

## 📋 Features

- ✅ Multiple streaming sources for maximum content availability
- ✅ Support for both movies and TV shows
- ✅ Easy provider switching within Stremio
- ✅ HD/1080p quality support
- ✅ Regular provider updates
- ✅ Fast and reliable streaming links
- ✅ **TMDB integration** for movie metadata and legal streaming availability
- ✅ **OMDb integration** for IMDb ratings and plot summaries
- ✅ Legal sources fallback (Tubi, YouTube, Public Domain)
- ✅ Comprehensive error handling and logging

## 📦 Project Structure

```
├── manifest.json           # Addon configuration and metadata
├── index.js               # Stream handler and core logic
├── sources.json           # Provider source configuration
├── API_SETUP.md           # API key setup instructions ⭐ READ THIS FIRST
├── TROUBLESHOOTING.md     # Troubleshooting guide for common issues
├── README.md              # This file
├── logo.png              # Addon logo (optional)
└── background.png        # Addon background (optional)
```

## 🔑 Getting API Keys

### TMDB (The Movie Database)
- **Free tier available** ✅
- **Benefits**: Movie metadata, ratings, legal streaming availability
- **Setup time**: ~5 minutes
- **Rate limits**: 40 requests per 10 seconds
- [Get TMDB Key →](https://www.themoviedb.org/settings/api)

### OMDb (Open Movie Database)
- **Free tier available** ✅
- **Benefits**: IMDb integration, ratings, plot summaries
- **Setup time**: ~5 minutes
- **Rate limits**: 1,000 requests per 24 hours
- [Get OMDb Key →](http://www.omdbapi.com/apikey.aspx)

**Full instructions**: See [API_SETUP.md](./API_SETUP.md)

## 🐛 Troubleshooting

### Links Not Showing?
1. Check that API keys are configured → See [API_SETUP.md](./API_SETUP.md)
2. Verify API keys are valid → Run test in [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#step-2-verify-api-keys-are-valid)
3. Check server logs for errors → `npm start` and look for ✅ or ❌ messages
4. Try a different movie (test with "The Matrix" - guaranteed to exist)
5. Clear Stremio cache and restart

**Full troubleshooting guide**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### 404 Errors?
- Usually indicates missing/invalid API key
- Verify your keys following [API_SETUP.md](./API_SETUP.md)
- Check network connectivity
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#-404-error-when-accessing-links)

### Still Having Issues?
1. Read [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) completely
2. Check the debugging checklist
3. Enable debug mode: `DEBUG=true npm start`
4. Review error messages in console

## 🔧 Advanced Configuration

### Environment Variables

```bash
# API Keys
export TMDB_API_KEY="your_key"
export OMDB_API_KEY="your_key"

# Debug Mode
export DEBUG="true"

# Custom Base URLs (optional)
export TMDB_BASE_URL="https://api.themoviedb.org/3"
export OMDB_BASE_URL="https://www.omdbapi.com"
```

### Configuration File

Edit `index.js` CONFIG object:

```javascript
const CONFIG = {
  tmdbApiKey: 'your_api_key_here',
  omdbApiKey: 'your_api_key_here',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  omdbBaseUrl: 'https://www.omdbapi.com'
};
```

## 📊 Supported Content Types

| Type | TMDB | OMDb | Free Sources | Status |
|------|------|------|--------------|--------|
| Movies | ✅ | ✅ | ✅ | Fully Supported |
| TV Series | ✅ | ✅ | ✅ | Fully Supported |
| Documentaries | ✅ | ✅ | ✅ | Fully Supported |
| Specials | ✅ | ✅ | ⚠️ | Partial Support |

## 🔐 Security & Privacy

- ✅ API keys stored locally or in environment variables
- ✅ No personal data transmitted
- ✅ Uses HTTPS for all API calls
- ✅ No tracking or analytics
- ✅ Open source - inspect the code

**Security notes**: See [API_SETUP.md - Security](./API_SETUP.md#-security-notes)

## 📈 Performance

- Average response time: < 500ms
- Cached results for frequently requested content
- Implements automatic retries with exponential backoff
- Rate limiting to prevent API throttling

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

Created by **Tre9995**

---

## 📞 Need Help?

| Question | Answer |
|----------|--------|
| Where do I get API keys? | [API_SETUP.md](./API_SETUP.md) |
| Why aren't links showing? | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#-links-not-showing-up) |
| How do I debug issues? | [TROUBLESHOOTING.md - Enable Debug Mode](./TROUBLESHOOTING.md#-enable-debug-mode) |
| What's the status of my API? | Check logs with `npm start` |
| How do I report a bug? | Create a GitHub issue |

---

**Last Updated:** May 28, 2026

**Version:** 1.1.0

### Changelog

**v1.1.0** (Current)
- ✨ Fixed TMDB/OMDb API integration
- ✨ Added comprehensive error handling and logging
- ✨ Added API_SETUP.md with complete configuration guide
- ✨ Added TROUBLESHOOTING.md for common issues
- 🐛 Fixed IMDb ID handling for TMDB lookups
- 🐛 Changed OMDb endpoint to HTTPS
- 📚 Improved documentation

**v1.0.1**
- Initial release

