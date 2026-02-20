# Quick Start - Frontend Deployment

## 1. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your backend URL
nano .env
```

Update these values:
```env
VITE_BACKEND_URL=http://your-backend-ip:3000/api/v1
VITE_WS_URL=ws://your-backend-ip:3000
VITE_NODE_ENV=production
```

## 2. Deploy with Docker Compose

```bash
# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## 3. Verify Deployment

```bash
# Health check
curl http://localhost/health

# Should return: "healthy"
```

## 4. Access Application

Open browser: `http://your-server-ip`

## Common Commands

```bash
# Stop
docker-compose down

# Restart
docker-compose restart

# View logs
docker-compose logs -f frontend

# Rebuild
docker-compose up -d --build
```

## Production Deployment

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Troubleshooting

### Can't connect to backend
```bash
# Test from container
docker exec urutibiz-frontend curl -I http://your-backend:3000/api/v1/health
```

### Port 80 already in use
```bash
# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Build fails
```bash
# Clear cache and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## Next Steps

1. Configure SSL (see DEPLOYMENT.md)
2. Set up domain name
3. Configure firewall
4. Set up monitoring
5. Configure backups

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
