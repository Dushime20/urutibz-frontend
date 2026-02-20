# Uruti eRental Frontend - Deployment Guide

## Quick Start

This guide covers deploying the Uruti eRental frontend using Docker and Docker Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)
- Access to backend API

## Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
VITE_BACKEND_URL=http://your-backend-url:3000/api/v1
VITE_WS_URL=ws://your-backend-url:3000
VITE_NODE_ENV=production
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

#### Development/Testing
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop
docker-compose down
```

#### Production
```bash
# Build and start with production config
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f frontend

# Stop
docker-compose -f docker-compose.prod.yml down
```

### Option 2: Docker Build & Run

```bash
# Build image
docker build \
  --build-arg VITE_BACKEND_URL=http://your-backend:3000/api/v1 \
  --build-arg VITE_WS_URL=ws://your-backend:3000 \
  --build-arg VITE_NODE_ENV=production \
  -t urutibiz-frontend:latest .

# Run container
docker run -d \
  --name urutibiz-frontend \
  -p 80:80 \
  --restart unless-stopped \
  urutibiz-frontend:latest
```

### Option 3: Manual Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy dist folder to your web server
# Example: Copy to nginx
cp -r dist/* /var/www/html/
```

## Nginx Configuration

The included `nginx.conf` provides:
- SPA routing support
- Static asset caching
- Security headers
- Health check endpoint

### Custom Nginx Config (Optional)

If deploying to existing nginx server:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install certbot
apt-get update
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

### Manual SSL Configuration

1. Place SSL certificates in `./ssl/` directory:
   - `ssl/cert.pem`
   - `ssl/key.pem`

2. Update nginx config:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

## Health Checks

The application includes a health check endpoint:

```bash
# Check if frontend is running
curl http://localhost/health

# Expected response: "healthy"
```

## Monitoring & Logs

### View Container Logs
```bash
# Follow logs
docker logs -f urutibiz-frontend

# Last 100 lines
docker logs --tail 100 urutibiz-frontend
```

### Container Stats
```bash
docker stats urutibiz-frontend
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs urutibiz-frontend

# Verify port availability
netstat -tulpn | grep :80

# Check container status
docker ps -a
```

### Build fails
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t urutibiz-frontend:latest .
```

### API connection issues
```bash
# Verify environment variables
docker exec urutibiz-frontend env | grep VITE

# Test backend connectivity from container
docker exec urutibiz-frontend curl -I http://your-backend:3000/api/v1/health
```

### Static files not loading
```bash
# Check nginx config
docker exec urutibiz-frontend nginx -t

# Verify files exist
docker exec urutibiz-frontend ls -la /usr/share/nginx/html
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Backend API accessible
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Firewall rules set (ports 80, 443)
- [ ] Health checks passing
- [ ] Logs monitoring configured
- [ ] Backup strategy in place
- [ ] CDN configured (optional)
- [ ] Analytics integrated (optional)

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

## Support

For issues or questions:
- Check logs: `docker logs urutibiz-frontend`
- Review nginx config: `docker exec urutibiz-frontend nginx -t`
- Test connectivity: `docker exec urutibiz-frontend curl localhost/health`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks)
