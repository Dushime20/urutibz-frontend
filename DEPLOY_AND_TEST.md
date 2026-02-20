# Frontend Deployment & Testing Guide

## Complete Deployment Steps

### Step 1: Stop Existing Containers
```bash
cd /opt/urutibiz/urutibz-frontend

# Stop any running containers
docker compose down

# Or if using old container name
docker stop urutibiz-frontend 2>/dev/null || true
docker rm urutibiz-frontend 2>/dev/null || true
```

### Step 2: Setup Environment
```bash
cp .env.docker .env
nano .env  # Verify settings are correct
```

### Step 3: Deploy with Docker Compose
```bash
docker compose up -d --build
```

### Step 4: Wait for Container to Start
```bash
# Wait 10 seconds for container to initialize
sleep 10
```

---

## ✅ Deployment Complete - Run These Tests

### Test 1: Check Container Status
```bash
docker compose ps
```

**Expected Output:**
```
NAME                  IMAGE                      STATUS
urutibiz-frontend     urutibiz-frontend:latest   Up (healthy)
```

---

### Test 2: Check Container Health
```bash
docker inspect --format='{{.State.Health.Status}}' urutibiz-frontend
```

**Expected Output:**
```
healthy
```

---

### Test 3: Test Health Endpoint (Local)
```bash
curl -I http://localhost:8080/health
```

**Expected Output:**
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/plain
```

---

### Test 4: Test Main Page (Local)
```bash
curl -I http://localhost:8080
```

**Expected Output:**
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
Content-Length: 3945
```

---

### Test 5: Test External Access
```bash
curl -I http://38.242.224.199:8080
```

**Expected Output:**
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
```

---

### Test 6: Check Container Logs
```bash
docker compose logs --tail 50 frontend
```

**Expected Output:**
Should show nginx access logs, no errors

---

### Test 7: Check Resource Usage
```bash
docker stats urutibiz-frontend --no-stream
```

**Expected Output:**
```
CONTAINER ID   NAME                CPU %   MEM USAGE / LIMIT   MEM %
abc123         urutibiz-frontend   0.01%   50MiB / 512MiB     9.77%
```

---

### Test 8: Verify Static Assets
```bash
curl -I http://localhost:8080/assets/index-j_Q68cru.js
```

**Expected Output:**
```
HTTP/1.1 200 OK
Content-Type: application/javascript
Cache-Control: public, immutable
```

---

### Test 9: Check Nginx Configuration
```bash
docker compose exec frontend nginx -t
```

**Expected Output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### Test 10: Browser Test
Open in your browser:
```
http://38.242.224.199:8080
```

**Expected Result:**
- ✅ Page loads without errors
- ✅ No 404 errors in browser console (F12)
- ✅ Application renders correctly

---

## Quick Test Script

Run all tests at once:

```bash
#!/bin/bash
echo "=== Frontend Deployment Tests ==="
echo ""

echo "1. Container Status:"
docker compose ps
echo ""

echo "2. Health Status:"
docker inspect --format='{{.State.Health.Status}}' urutibiz-frontend
echo ""

echo "3. Health Endpoint:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/health
echo ""

echo "4. Main Page:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080
echo ""

echo "5. External Access:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://38.242.224.199:8080
echo ""

echo "6. Resource Usage:"
docker stats urutibiz-frontend --no-stream
echo ""

echo "=== Tests Complete ==="
echo "Access your frontend at: http://38.242.224.199:8080"
```

Save as `test-deployment.sh` and run:
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

---

## Troubleshooting Failed Tests

### If Container Not Running
```bash
# Check logs
docker compose logs frontend

# Restart
docker compose restart frontend
```

### If Health Check Fails
```bash
# Check nginx status
docker compose exec frontend ps aux

# Check nginx config
docker compose exec frontend nginx -t

# Restart nginx
docker compose restart frontend
```

### If 404 Errors
```bash
# Check files exist
docker compose exec frontend ls -la /usr/share/nginx/html/

# Check assets folder
docker compose exec frontend ls -la /usr/share/nginx/html/assets/
```

### If Can't Access Externally
```bash
# Check firewall
sudo ufw status | grep 8080

# Open port if needed
sudo ufw allow 8080/tcp
```

---

## Success Criteria

Your deployment is successful when:

- ✅ Container status shows "Up (healthy)"
- ✅ Health endpoint returns 200 OK
- ✅ Main page returns 200 OK
- ✅ External access works
- ✅ No errors in logs
- ✅ Browser loads the application
- ✅ No 404 errors in browser console

---

## Next Steps After Successful Deployment

1. **Monitor logs:**
   ```bash
   docker compose logs -f frontend
   ```

2. **Check metrics:**
   ```bash
   docker stats urutibiz-frontend
   ```

3. **Setup monitoring** (optional):
   - Configure uptime monitoring
   - Setup log aggregation
   - Enable metrics collection

4. **Configure SSL** (optional):
   - Install SSL certificate
   - Update nginx config
   - Redirect HTTP to HTTPS

---

## Deployment Complete! 🎉

Your frontend is now running at:
- **Local:** http://localhost:8080
- **External:** http://38.242.224.199:8080

For management commands, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
