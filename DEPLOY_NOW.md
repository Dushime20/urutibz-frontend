# Deploy Frontend NOW - Step by Step

## Current Status
- Dev server running on port 5174 ✓
- Need to deploy production build to nginx on port 8080

## Step 1: Stop Dev Server (if running)

```bash
# Find and stop any running dev server
pkill -f "vite"

# Or if running in a terminal, press Ctrl+C
```

## Step 2: Build Production Version

```bash
cd /opt/urutibiz/urutibz-frontend

# Make sure .env is configured
cat .env

# Should show:
# VITE_BACKEND_URL=http://38.242.224.199:3000/api/v1
# VITE_WS_URL=ws://38.242.224.199:3000
# VITE_NODE_ENV=production

# Build
npm run build
```

## Step 3: Deploy to Nginx

```bash
# Copy built files
cp -r dist/* /var/www/html/

# Set permissions
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/
```

## Step 4: Configure Nginx (One-Time Setup)

```bash
# Create nginx config
cat > /etc/nginx/sites-available/urutibiz-frontend << 'EOF'
server {
    listen 8080;
    server_name 38.242.224.199;
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

    # SPA routing
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

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable frontend site
ln -sf /etc/nginx/sites-available/urutibiz-frontend /etc/nginx/sites-enabled/

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx

# Check nginx status
systemctl status nginx
```

## Step 5: Open Firewall Port

```bash
# Allow port 8080
ufw allow 8080/tcp

# Check firewall status
ufw status
```

## Step 6: Verify Deployment

```bash
# Test locally (correct command - single http://)
curl -I http://localhost:8080

# Test with server IP
curl -I http://38.242.224.199:8080

# Check if nginx is listening on port 8080
netstat -tulpn | grep :8080
```

Expected output:
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
```

## Step 7: Access in Browser

Open: `http://38.242.224.199:8080`

---

## Quick Update (After Initial Setup)

When you need to update the frontend:

```bash
cd /opt/urutibiz/urutibz-frontend
npm run build
cp -r dist/* /var/www/html/
```

That's it! No need to restart nginx for content updates.

---

## Troubleshooting

### Port 8080 not accessible

```bash
# Check if nginx is running
systemctl status nginx

# Check if listening on port 8080
netstat -tulpn | grep :8080

# Check nginx error logs
tail -50 /var/log/nginx/error.log

# Restart nginx
systemctl restart nginx
```

### Site shows old version

```bash
# Clear browser cache: Ctrl+Shift+R
# Or rebuild and redeploy
npm run build
cp -r dist/* /var/www/html/
```

### Can't connect to backend

```bash
# Check .env file
cat .env

# Test backend
curl -I http://38.242.224.199:3000/api/v1/health

# If backend URL is wrong, update .env and rebuild
nano .env
npm run build
cp -r dist/* /var/www/html/
```

### Nginx won't start

```bash
# Check config syntax
nginx -t

# Check what's using port 8080
netstat -tulpn | grep :8080

# View detailed error
journalctl -xeu nginx
```

---

## Summary

✓ Frontend built and deployed to `/var/www/html/`
✓ Nginx configured on port 8080
✓ Firewall allows port 8080
✓ Accessible at `http://38.242.224.199:8080`
