# Quick Redeploy Guide

## One-Command Redeploy

Stop old containers and deploy fresh:

```bash
cd /opt/urutibiz/urutibz-frontend && \
docker compose down && \
docker stop urutibiz-frontend 2>/dev/null || true && \
docker rm urutibiz-frontend 2>/dev/null || true && \
docker compose up -d --build && \
sleep 10 && \
curl -I http://localhost:8080
```

---

## Step-by-Step Redeploy

### 1. Stop Everything
```bash
cd /opt/urutibiz/urutibz-frontend

# Stop compose containers
docker compose down

# Stop any standalone containers
docker stop urutibiz-frontend 2>/dev/null || true
docker rm urutibiz-frontend 2>/dev/null || true
```

### 2. Clean Up (Optional)
```bash
# Remove old images (optional)
docker rmi urutibiz-frontend:latest 2>/dev/null || true

# Clean build cache (optional)
docker builder prune -f
```

### 3. Deploy Fresh
```bash
# Deploy
docker compose up -d --build

# Wait for startup
sleep 10
```

### 4. Verify
```bash
# Check status
docker compose ps

# Test endpoint
curl -I http://localhost:8080
```

---

## Using Deploy Script

```bash
cd /opt/urutibiz/urutibz-frontend

# Make sure script exists and is executable
chmod +x deploy.sh

# Run deployment (automatically stops old containers)
./deploy.sh

# Or for production
./deploy.sh docker-compose.prod.yml
```

---

## Quick Status Check

```bash
# See what's running
docker ps | grep frontend

# See all containers (including stopped)
docker ps -a | grep frontend
```

---

## Force Clean Redeploy

If you have issues, do a complete clean:

```bash
cd /opt/urutibiz/urutibz-frontend

# Stop everything
docker compose down
docker stop $(docker ps -aq --filter name=urutibiz-frontend) 2>/dev/null || true
docker rm $(docker ps -aq --filter name=urutibiz-frontend) 2>/dev/null || true

# Remove images
docker rmi $(docker images -q urutibiz-frontend) 2>/dev/null || true

# Clean build cache
docker builder prune -af

# Fresh deploy
docker compose up -d --build
```

---

## After Redeploy

Always verify:
```bash
# 1. Container running
docker compose ps

# 2. Health check
docker inspect --format='{{.State.Health.Status}}' urutibiz-frontend

# 3. Test endpoint
curl -I http://localhost:8080
curl -I http://38.242.224.199:8080

# 4. Check logs
docker compose logs --tail 50 frontend
```
