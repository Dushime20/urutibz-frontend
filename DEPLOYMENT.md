n# Uruti eRental Frontend - Deployment Guide

## Prerequisites

- Node.js 20+ and npm
- Nginx web server
- Access to backend API

## Quick Deploy (Production Ready)

### Step 1: Configure Environment

```bash
cd /opt/urutibiz/urutibz-frontend

# Edit .env file with your backend URL
nano .env
```

Update these values:
```env
VITE_BACKEND_URL=http://your-backend-ip:3000/api/v1
VITE_WS_URL=ws://your-backend-ip:3000
VITE_NODE_ENV=production
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build for Production

```bash
npm run build
```

This creates optimized production files in the `dist/` folder.

### Step 4: Deploy to Web Server

```bash
# Copy built files to nginx web root
cp -r dist/* /var/www/html/

# Set proper permissions
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/
```

### Step 5: Configure Nginx

Create a new nginx config for the frontend:

```bash
# Create frontend nginx config
cat > /etc/nginx/sites-available/urutibiz-frontend << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # Change to your domain or use _
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remove default nginx site (optional)
rm -f /etc/nginx/sites-enabled/default

# Enable frontend site
ln -sf /etc/nginx/sites-available/urutibiz-frontend /etc/nginx/sites-enabled/
```

### Step 6: Restart Nginx

```bash
# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

# Check status
systemctl status nginx
```

### Step 7: Verify Deployment

```bash
# Check if site is accessible
curl -I http://http://38.242.224.199:8080

# Should return: HTTP/1.1 200 OK
```

Access your frontend at: `http://38.242.224.199:8080`

## Quick Update (Redeploy)

When you need to update the frontend:

```bash
cd /opt/urutibiz/urutibz-frontend

# Pull latest code (if using git)
git pull

# Install any new dependencies
npm install

# Build
npm run build

# Deploy
cp -r dist/* /var/www/html/

# Clear browser cache or use Ctrl+Shift+R
```

## One-Line Deploy Script

Create a deploy script for easy updates:

```bash
# Create deploy script
cat > /opt/urutibiz/deploy-frontend.sh << 'EOF'
#!/bin/bash
cd /opt/urutibiz/urutibz-frontend
echo "Building frontend..."
npm run build
echo "Deploying to web server..."
cp -r dist/* /var/www/html/
chown -R www-data:www-data /var/www/html/
echo "✓ Frontend deployed successfully!"
EOF

# Make executable
chmod +x /opt/urutibiz/deploy-frontend.sh

# Run anytime to deploy
/opt/urutibiz/deploy-frontend.sh
```

## Alternative: Docker Deployment

If you prefer Docker:

### Build Docker Image

```bash
cd /opt/urutibiz/urutibz-frontend

docker build \
  --build-arg VITE_BACKEND_URL=http://your-backend:3000/api/v1 \
  --build-arg VITE_WS_URL=ws://your-backend:3000 \
  -t urutibiz-frontend:latest .
```

### Run Container

```bash
docker run -d \
  --name urutibiz-frontend \
  -p 80:80 \
  --restart unless-stopped \
  urutibiz-frontend:latest
```

### Docker Commands

```bash
# View logs
docker logs -f urutibiz-frontend

# Restart
docker restart urutibiz-frontend

# Stop
docker stop urutibiz-frontend

# Remove
docker rm -f urutibiz-frontend
```

### Firewall Configuration

Make sure port 8080 is open:

```bash
# Allow port 8080
ufw allow 8080/tcp

# Check firewall status
ufw status
```

### Using Let's Encrypt

```bash
# Install certbot
apt-get update
apt-get install certbot python3-certbot-nginx -y

# Obtain certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

After SSL setup, nginx will automatically redirect HTTP to HTTPS.

## Monitoring & Logs

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log

# Check last 50 errors
tail -50 /var/log/nginx/error.log
```

### Check Site Status

```bash
# Test locally
curl -I http://localhost

# Test from outside
curl -I http://your-server-ip

# Check nginx status
systemctl status nginx
```

## Troubleshooting

### Build Fails

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Nginx Won't Start

```bash
# Check nginx config syntax
nginx -t

# Check if port 80 is in use
netstat -tulpn | grep :80

# Check nginx error logs
tail -50 /var/log/nginx/error.log

# Restart nginx
systemctl restart nginx
```

### Site Not Loading

```bash
# Check if nginx is running
systemctl status nginx

# Check if files exist
ls -la /var/www/html/

# Check file permissions
ls -la /var/www/html/index.html

# Fix permissions if needed
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/
```

### API Connection Issues

```bash
# Check .env file
cat /opt/urutibiz/urutibz-frontend/.env

# Test backend connectivity
curl -I http://your-backend-ip:3000/api/v1/health

# Rebuild with correct backend URL
nano .env  # Update VITE_BACKEND_URL
npm run build
cp -r dist/* /var/www/html/
```

### White Screen / Blank Page

```bash
# Check browser console for errors (F12)
# Usually means wrong API URL or CORS issue

# Verify build completed successfully
ls -la /opt/urutibiz/urutibz-frontend/dist/

# Check if index.html exists
cat /var/www/html/index.html

# Clear browser cache (Ctrl+Shift+R)
```

## Production Checklist

- [ ] .env file configured with correct backend URL
- [ ] npm install completed successfully
- [ ] npm run build completed without errors
- [ ] Files copied to /var/www/html/
- [ ] Nginx configured for SPA routing
- [ ] Nginx restarted successfully
- [ ] Site accessible via browser
- [ ] Backend API connection working
- [ ] SSL certificate installed (optional)
- [ ] Domain DNS configured (optional)
- [ ] Firewall allows ports 80, 443

## Scaling & Performance

### Horizontal Scaling
```bash
# Run multiple instances behind load balancer
docker-compose -f docker-compose.prod.yml up -d --scale frontend=3
```

### CDN Integration
Consider using CloudFlare, AWS CloudFront, or similar CDN for:
- Static asset delivery
- DDoS protection
- Global edge caching
- SSL termination

## Backup & Recovery

### Backup Configuration
```bash
# Backup environment and configs
tar -czf frontend-config-backup.tar.gz .env nginx.conf docker-compose*.yml
```

### Disaster Recovery
```bash
# Restore from backup
tar -xzf frontend-config-backup.tar.gz

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

## Updates & Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
curl http://localhost/health
```

### Zero-Downtime Updates
```bash
# Build new image
docker build -t urutibiz-frontend:new .

# Start new container
docker run -d --name frontend-new -p 8080:80 urutibiz-frontend:new

# Test new version
curl http://localhost:8080/health

# Switch traffic (update load balancer or nginx upstream)
# Stop old container
docker stop urutibiz-frontend
docker rm urutibiz-frontend

# Rename new container
docker rename frontend-new urutibiz-frontend
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails with memory error | Increase server RAM or add swap space |
| 404 on page refresh | Check nginx SPA routing config |
| API calls fail | Verify VITE_BACKEND_URL in .env |
| Slow initial load | Enable gzip compression in nginx |
| Old version showing | Clear browser cache (Ctrl+Shift+R) |

## Quick Reference

```bash
# Full deployment from scratch
cd /opt/urutibiz/urutibz-frontend
npm install
npm run build
cp -r dist/* /var/www/html/
systemctl restart nginx

# Quick update
cd /opt/urutibiz/urutibz-frontend
npm run build && cp -r dist/* /var/www/html/

# Check status
systemctl status nginx
curl -I http://localhost

# View logs
tail -f /var/log/nginx/error.log
```
