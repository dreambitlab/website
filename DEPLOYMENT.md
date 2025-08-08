# Deployment Instructions

## Quick Start
1. Upload the contents of this dist folder to your server
2. Run: npm install --production
3. Run: npm start
4. Your website will be available on the configured port (default: 3000)

## Environment Variables
Copy .env.example to .env and configure as needed:
- PORT: Server port (default: 3000)
- NODE_ENV: Environment (production recommended)

## Hosting Platforms

### Heroku
1. Create a new Heroku app
2. Connect your repository
3. Deploy from the dist folder

### Vercel
1. Install Vercel CLI: npm i -g vercel
2. Run: vercel
3. Follow the prompts

### DigitalOcean App Platform
1. Create a new app
2. Connect your repository
3. Set build command: npm install
4. Set run command: npm start

### Traditional VPS/Server
1. Upload files via FTP/SSH
2. Install Node.js (v14+ recommended)
3. Run: npm install --production
4. Run: npm start
5. Use PM2 for process management: pm2 start server.js

## SSL/HTTPS
For production, ensure you have SSL certificates configured.
Most hosting platforms provide this automatically.
