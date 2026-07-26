# Snakeeyes Addon - Deployment Guide

This addon can be deployed on several free platforms. Choose your preferred option:

## Option 1: Railway (Recommended - Free tier available)

1. **Sign up** at https://railway.app
2. **Connect GitHub** to your Railway account
3. **Create new project** → Select "Deploy from GitHub repo"
4. **Select** `Tre9995/Snakeeyes-repo`
5. **Configure environment:**
   - `PORT`: Leave as default (Railway sets this automatically)
6. **Deploy** - Railway automatically deploys on push to main
7. **Get your URL:** https://your-railway-url/manifest.json

## Option 2: Fly.io (Free tier available)

1. **Install Fly CLI:** https://fly.io/docs/getting-started/installing-flyctl/
2. **Sign up** at https://fly.io
3. **Clone your repo locally:**
   ```bash
   git clone https://github.com/Tre9995/Snakeeyes-repo.git
   cd Snakeeyes-repo
   ```
4. **Deploy:**
   ```bash
   fly launch
   # Follow prompts, accept default settings
   fly deploy
   ```
5. **Get your URL:** https://snakeeyes-addon.fly.dev/manifest.json

## Option 3: Heroku (Free tier removed, but cheapest paid option)

1. **Install Heroku CLI**
2. **Deploy:**
   ```bash
   heroku login
   heroku create snakeeyes-addon
   git push heroku main
   ```

## Option 4: Koyeb (Free tier available)

1. **Sign up** at https://koyeb.com
2. **Connect GitHub**
3. **Create service** → Select your repo
4. **Set start command:** `npm start`
5. **Deploy**

## Testing Your Deployment

After deployment, test if it's working:

```bash
curl https://your-deployed-url/health
# Should return: {"status":"ok"}

curl https://your-deployed-url/manifest.json
# Should return the addon manifest
```

## Using in Stremio

Once deployed, add to Stremio:
- **Installation URL:** `https://your-deployed-url/manifest.json`

Replace `your-deployed-url` with your actual deployment URL.

## Monitoring

- **Railway:** Check logs in dashboard
- **Fly.io:** Use `fly logs` command
- **Koyeb:** Check logs in dashboard

## Troubleshooting

- **Dependencies not installing?** Make sure `package-lock.json` is committed
- **Port issues?** The app reads from `PORT` environment variable
- **Health check failing?** Check that `node-fetch` is installed: `npm list node-fetch`
