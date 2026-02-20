# Uruti Frontend - Docker Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Environment Configuration](#environment-configuration)
- [Deployment Methods](#deployment-methods)
- [Container Management](#container-management)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)
- [Production Best Practices](#production-best-practices)

---

## Prerequisites

### System Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+ (optional)
- 2GB RAM minimum
- 10GB disk space
- Ubuntu 20.04+ or similar Linux distribution

### Install Docker (if not installed)

```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add current user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

---

## Architecture Overview

### Multi-Stage Build
The Dockerfile uses a multi-stage build pattern:
1. **Builder Stage**: Compiles TypeScript and bundles assets with Vite
2. **Production Stage**: Serves static files via Nginx Alpine

### Container Structure
```
urutibiz-frontend:latest
├── nginx:alpine (base)
├── /usr/share/nginx/html/ (static files)
├── /etc/nginx/conf.d/default.conf (nginx config)
└── Health check on port 80
```

---

## Environment Configuration

### Environment File Structure

The application uses a `.env` file for configuration. Docker Compose automatically loads this file.

```bash
cd /opt/urutibiz/urutibz-frontend

# Copy the template
cp .env.docker .env

# Edit with your values
nano .env
```

**Required variables:**
```env
VITE_BACKEND_URL=http://38.242.224.199:3000/api/v1
VITE_WS_URL=ws://38.242.224.199:3000
VITE_NODE_ENV=production
```

Docker Compose will automatically pass these to the build process.

---

## Deployment Methods

### Method 1: Docker Compose (Recommended)

Docker Compose reads configuration from `docker-compose.yml` and `.env` automatically.

#### Quick Start

```bash
cd /opt/urutibiz/urutibz-frontend

# 1. Setup environment
cp .env.docker .env
nano .env  # Update if needed

# 2. Deploy
docker compose up -d --build

# 3. Verify
docker compose ps
docker compose logs -f frontend
```

#### Production Deployment

```bash
cd /opt/urutibiz/urutibz-frontend

# 1. Setup environment
cp .env.docker .env
nano .env  # Update if needed

# 2. Deploy with production config
docker compose -f docker-compose.prod.yml up -d --build

# 3. Verify
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f frontend
```

#### Management Commands

```bash
# View logs
docker compose logs -f frontend

# Restart
docker compose restart frontend

# Stop
docker compose stop

# Remove
docker compose down

# Rebuild and restart
docker compose up -d --build --force-recreate
```

---

### Method 2: Docker CLI (Advanced)

For manual control, use Docker CLI with environment variables from `.env`:

```bash
cd /opt/urutibiz/urutibz-frontend

# Load environment variables
set -a
source .env
set +a

# Build image
docker build \
  --build-arg VITE_BACKEND_URL="${VITE_BACKEND_URL}" \
  --build-arg VITE_WS_URL="${VITE_WS_URL}" \
  --build-arg VITE_NODE_ENV="${VITE_NODE_ENV}" \
  -t urutibiz-frontend:latest \
  .

# Run container
docker run -d \
  --name urutibiz-frontend \
  -p 8080:80 \
  --restart unless-stopped \
  --env-file .env \
  urutibiz-frontend:latest
```

---

## Container Management

### Start/Stop/Restart

```bash
# Start container
docker start urutibiz-frontend

# Stop container (graceful shutdown)
docker stop urutibiz-frontend

# Restart container
docker restart urutibiz-frontend

# Force stop (if graceful fails)
docker kill urutibiz-frontend
```

### View Container Information

```bash
# Container status
docker ps -a | grep urutibiz-frontend

# Detailed information
docker inspect urutibiz-frontend

# Resource usage
docker stats urutibiz-frontend

# Port mappings
docker port urutibiz-frontend

# Health check status
docker inspect --format='{{json .State.Health}}' urutibiz-frontend | jq
```

### Execute Commands in Container

```bash
# Open shell in container
docker exec -it urutibiz-frontend sh

# Check nginx config
docker exec urutibiz-frontend nginx -t

# View nginx processes
docker exec urutibiz-frontend ps aux

# Check files
docker exec urutibiz-frontend ls -la /usr/share/nginx/html/

# Test internal connectivity
docker exec urutibiz-frontend curl -I http://localhost/health
```

---

## Monitoring & Logging

### View Logs

```bash
# Follow logs in real-time
docker logs -f urutibiz-frontend

# Last 100 lines
docker logs --tail 100 urutibiz-frontend

# Logs since specific time
docker logs --since 30m urutibiz-frontend

# Logs with timestamps
docker logs -t urutibiz-frontend

# Export logs to file
docker logs urutibiz-frontend > frontend-logs-$(date +%Y%m%d).log
```

### Monitor Resources

```bash
# Real-time resource usage
docker stats urutibiz-frontend

# Container processes
docker top urutibiz-frontend

# Disk usage
docker system df

# Container size
docker ps -s | grep urutibiz-frontend
```

### Health Checks

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' urutibiz-frontend

# View health check logs
docker inspect --format='{{json .State.Health}}' urutibiz-frontend | jq

# Manual health check
curl -f http://localhost:8080/health || echo "Health check failed"
```

---

## Troubleshooting

### Container Won't Start

```bash
# Check container logs
docker logs urutibiz-frontend

# Check if port is already in use
sudo netstat -tulpn | grep :8080
# Or
sudo ss -tulpn | grep :8080

# Check Docker daemon status
sudo systemctl status docker

# Restart Docker daemon
sudo systemctl restart docker
```

### Build Failures

```bash
# Clear build cache
docker builder prune -a

# Build with no cache
docker build --no-cache -t urutibiz-frontend:latest .

# Check disk space
df -h

# Clean up unused Docker resources
docker system prune -a
```

### Container Crashes

```bash
# Check exit code
docker inspect --format='{{.State.ExitCode}}' urutibiz-frontend

# View last logs before crash
docker logs --tail 200 urutibiz-frontend

# Check resource limits
docker stats urutibiz-frontend

# Increase memory limit
docker update --memory="1g" urutibiz-frontend
```

### Network Issues

```bash
# Check container network
docker inspect --format='{{.NetworkSettings.IPAddress}}' urutibiz-frontend

# Test connectivity from container
docker exec urutibiz-frontend ping -c 3 8.8.8.8

# Check DNS resolution
docker exec urutibiz-frontend nslookup google.com

# Test backend connectivity
docker exec urutibiz-frontend curl -I http://38.242.224.199:3000/api/v1/health
```

### Permission Issues

```bash
# Check file permissions in container
docker exec urutibiz-frontend ls -la /usr/share/nginx/html/

# Fix permissions (if needed)
docker exec urutibiz-frontend chown -R nginx:nginx /usr/share/nginx/html/
```

---

## Production Best Practices

### 1. Image Tagging Strategy

```bash
# Tag with version and date
docker build \
  -t urutibiz-frontend:latest \
  -t urutibiz-frontend:v1.0.0 \
  -t urutibiz-frontend:$(date +%Y%m%d) \
  .

# List all tags
docker images urutibiz-frontend
```

### 2. Resource Limits

```bash
# Run with resource constraints
docker run -d \
  --name urutibiz-frontend \
  --memory="512m" \
  --memory-swap="1g" \
  --cpus="0.5" \
  --pids-limit=100 \
  -p 8080:80 \
  urutibiz-frontend:latest
```

### 3. Security Hardening

```bash
# Run as non-root user (already configured in Dockerfile)
# Use read-only filesystem where possible
docker run -d \
  --name urutibiz-frontend \
  --read-only \
  --tmpfs /var/cache/nginx \
  --tmpfs /var/run \
  -p 8080:80 \
  urutibiz-frontend:latest

# Scan image for vulnerabilities
docker scan urutibiz-frontend:latest
```

### 4. Backup & Restore

```bash
# Save image to tar file
docker save urutibiz-frontend:latest | gzip > urutibiz-frontend-backup.tar.gz

# Load image from tar file
gunzip -c urutibiz-frontend-backup.tar.gz | docker load

# Export container filesystem
docker export urutibiz-frontend > urutibiz-frontend-container.tar
```

### 5. Zero-Downtime Deployment

```bash
# Build new image
docker build -t urutibiz-frontend:new .

# Start new container on different port
docker run -d \
  --name urutibiz-frontend-new \
  -p 8081:80 \
  urutibiz-frontend:new

# Test new container
curl -I http://localhost:8081

# Switch traffic (update load balancer or nginx upstream)
# Then stop old container
docker stop urutibiz-frontend
docker rm urutibiz-frontend

# Rename new container
docker rename urutibiz-frontend-new urutibiz-frontend

# Update port mapping if needed
docker stop urutibiz-frontend
docker rm urutibiz-frontend
docker run -d \
  --name urutibiz-frontend \
  -p 8080:80 \
  urutibiz-frontend:new
```

### 6. One-Command Deployment Script

Create a professional deployment script that reads from Docker Compose configuration:

```bash
nano deploy.sh
```

Add this content:

```bash
#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="${1:-docker-compose.yml}"
PROJECT_NAME="urutibiz-frontend"

echo -e "${GREEN}=== Frontend Deployment Started ===${NC}"
echo "Using compose file: ${COMPOSE_FILE}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file from .env.docker template"
    exit 1
fi

# Load and validate environment
echo -e "${YELLOW}Validating environment...${NC}"
set -a
source .env
set +a

if [ -z "${VITE_BACKEND_URL:-}" ]; then
    echo -e "${RED}Error: VITE_BACKEND_URL not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment validated${NC}"
echo "  Backend URL: ${VITE_BACKEND_URL}"
echo "  WebSocket URL: ${VITE_WS_URL}"
echo ""

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose -f "${COMPOSE_FILE}" down 2>/dev/null || true
docker stop urutibiz-frontend 2>/dev/null || true
docker rm urutibiz-frontend 2>/dev/null || true
echo -e "${GREEN}✓ Old containers stopped${NC}"
echo ""

# Build and deploy
echo -e "${YELLOW}Building and deploying...${NC}"
docker compose -f "${COMPOSE_FILE}" up -d --build --remove-orphans

# Wait for health check
echo -e "${YELLOW}Waiting for container to be healthy...${NC}"
sleep 10

# Get container name from compose
CONTAINER_NAME=$(docker compose -f "${COMPOSE_FILE}" ps -q frontend 2>/dev/null | xargs docker inspect --format='{{.Name}}' 2>/dev/null | sed 's/\///' || echo "urutibiz-frontend")

# Check health
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "unknown")
echo "Container health: ${HEALTH}"

# Test endpoint
echo -e "${YELLOW}Testing endpoint...${NC}"
if curl -f -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo "Check logs: docker compose -f ${COMPOSE_FILE} logs frontend"
    exit 1
fi

# Show status
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
docker compose -f "${COMPOSE_FILE}" ps
echo ""
echo -e "${GREEN}Frontend is running at:${NC}"
echo "  Local: http://localhost:8080"
echo "  External: http://38.242.224.199:8080"
echo ""
echo "View logs: docker compose -f ${COMPOSE_FILE} logs -f frontend"
```

Save and make executable:

```bash
chmod +x deploy.sh

# Run deployment
./deploy.sh

# Or for production
./deploy.sh docker-compose.prod.yml
```

### 7. Monitoring Setup

```bash
# Install monitoring tools
docker run -d \
  --name cadvisor \
  -p 8081:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest

# Access metrics at http://localhost:8081
```

---

## Firewall Configuration

```bash
# Allow port 8080
sudo ufw allow 8080/tcp

# Check firewall status
sudo ufw status

# Reload firewall
sudo ufw reload
```

---

## Quick Reference Commands

```bash
# Deploy (reads from docker-compose.yml and .env)
docker compose up -d --build

# Deploy production
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose logs -f frontend

# Restart
docker compose restart frontend

# Stop
docker compose stop

# Remove
docker compose down

# Check status
docker compose ps

# Execute command in container
docker compose exec frontend sh

# View environment variables
docker compose config
```

---

## Support & Maintenance

### Regular Maintenance Tasks

```bash
# Weekly: Clean up unused resources
docker system prune -a --volumes

# Monthly: Update base images
docker pull nginx:alpine
docker build --no-cache -t urutibiz-frontend:latest .

# Check for security updates
docker scan urutibiz-frontend:latest
```

### Backup Schedule

```bash
# Daily: Export logs
docker logs urutibiz-frontend > /backup/frontend-logs-$(date +%Y%m%d).log

# Weekly: Save image
docker save urutibiz-frontend:latest | gzip > /backup/frontend-$(date +%Y%m%d).tar.gz
```

---

## Conclusion

Your frontend is now deployed using Docker with:
- ✅ Multi-stage optimized build
- ✅ Health checks configured
- ✅ Resource limits set
- ✅ Logging configured
- ✅ Auto-restart enabled
- ✅ Production-ready nginx setup

**Access your application at:** `http://38.242.224.199:8080`

For issues or questions, check the troubleshooting section or review container logs.
