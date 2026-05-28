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

## 📋 Features

- ✅ Multiple streaming sources for maximum content availability
- ✅ Support for both movies and TV shows
- ✅ Easy provider switching within Stremio
- ✅ HD/1080p quality support
- ✅ Regular provider updates
- ✅ Fast and reliable streaming links

## 🔧 Configuration

The addon is configured via `manifest.json` which lists all available providers with their settings. Each provider is enabled by default and can be toggled on/off in Stremio settings.

### Provider Details

| Provider | Type | Status |
|----------|------|--------|
| CinemaCity | Movies & TV | ✅ Active |
| Dooflix | Movies & TV | ✅ Active |
| AllMovieland | Movies & TV | ✅ Active |
| PureStream | Movies & TV | ✅ Active |
| MovieBox | Movies & TV | ✅ Active |
| Sinewix | Movies & TV | ✅ Active |
| NetMirror | Movies & TV | ✅ Active |

## 📦 Project Structure

```
├── manifest.json      # Addon configuration and metadata
├── index.js           # Stream handler and core logic
├── sources.json       # Provider source configuration
├── README.md          # This file
└── logo.png           # Addon logo (optional)
```

## 🐛 Troubleshooting

**Links not showing?**
- Ensure the manifest URL is correctly added to Stremio
- Clear your browser cache
- Restart Stremio application

**Provider not working?**
- Check if the provider website is accessible
- Some providers may have regional restrictions
- Try a different provider

## 📝 License

MIT License - See LICENSE file for details

## 👤 Author

Created by **Tre9995**

---

**Last Updated:** May 28, 2026

**Version:** 1.0.1
