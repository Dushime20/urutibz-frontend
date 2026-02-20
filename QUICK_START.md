# Quick Start - Frontend Deployment

## Complete Deployment in 5 Steps

### 1. Navigate to Project

```bash
cd /opt/urutibiz/urutibz-frontend
```

### 2. Configure Backend URL

```bash
nano .env
```

Set your backend URL:
```env
VITE_BACKEND_URL=http://your-backend-ip:3000/api/v1
VITE_WS_URL=ws://your-backend-ip:3000
VITE_NODE_ENV=production
```

### 3. Install & Build

```bash
npm install
npm run build
```

### 4. Deploy to Nginx

```bash
cp -r dist/* /var/www/html/
chown -R www-data:www-data /var/www/html/
```

### 5. Configure & Restart Nginx

```bash
# Run nginx setup script (one-time setup)
chmod +x nginx-setup.sh
./nginx-setup.sh
```

Or if already configured:
```bash
systemctl restart nginx
```

## Verify Deployment

```bash
# Check nginx status
systemctl status nginx

# Test site
curl -I http://localhost:8080
```

Open browser: `http://38.242.224.199:8080`

---

## Quick Update (Redeploy)

```bash
cd /opt/urutibiz/urutibz-frontend
npm run build
cp -r dist/* /var/www/html/
```

---

## One-Command Deploy Script

Create this script once:

```bash
cat > /opt/urutibiz/deploy-frontend.sh << 'EOF'
#!/bin/bash
cd /opt/urutibiz/urutibz-frontend
echo "Building..."
npm run build
echo "Deploying..."
cp -r dist/* /var/www/html/
chown -R www-data:www-data /var/www/html/
echo "✓ Done!"
EOF

chmod +x /opt/urutibiz/deploy-frontend.sh
```

Then deploy anytime with:
```bash
/opt/urutibiz/deploy-frontend.sh
```

---

## Nginx Configuration

If nginx not configured yet, create frontend config:

```bash
cat > /etc/nginx/sites-available/urutibiz-frontend << 'EOF'
server {
    listen 8080;
    server_name 38.242.224.199;
    root /var/www/html;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(css|js|jpg|png|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable frontend site
ln -sf /etc/nginx/sites-available/urutibiz-frontend /etc/nginx/sites-enabled/

# Test and restart
nginx -t
systemctl restart nginx
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Nginx Won't Start
```bash
# Check config
nginx -t

# Check what's using port 80
netstat -tulpn | grep :80

# View errors
tail -20 /var/log/nginx/error.log
```

### Site Shows Old Version
```bash
# Clear browser cache: Ctrl+Shift+R
# Or rebuild and redeploy
npm run build
cp -r dist/* /var/www/html/
```

### Can't Connect to Backend
```bash
# Check .env file
cat .env

# Test backend
curl -I http://your-backend-ip:3000/api/v1/health

# Rebuild with correct URL
nano .env
npm run build
cp -r dist/* /var/www/html/
```

---

## Common Commands

```bash
# Full deploy
cd /opt/urutibiz/urutibz-frontend && npm run build && cp -r dist/* /var/www/html/

# Check nginx
systemctl status nginx
nginx -t

# Restart nginx
systemctl restart nginx

# View logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Check site
curl -I http://localhost:8080
```

---

## Next Steps

1. ✓ Frontend deployed
2. Configure SSL (optional): `certbot --nginx -d yourdomain.com`
3. Set up domain DNS
4. Configure firewall: `ufw allow 80/tcp && ufw allow 443/tcp`

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
