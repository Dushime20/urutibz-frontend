#!/bin/bash
# Nginx Configuration Script for Uruti Frontend

echo "Creating nginx configuration for Uruti Frontend..."

# Create nginx config file
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
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache static assets - images
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|mp4|ogg|webm)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Cache static assets - CSS and JS
    location ~* \.(css|js)$ {
        try_files $uri =404;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Cache fonts
    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

echo "✓ Nginx config created at /etc/nginx/sites-available/urutibiz-frontend"

# Remove default site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Removing default nginx site..."
    rm -f /etc/nginx/sites-enabled/default
    echo "✓ Default site removed"
fi

# Enable frontend site
echo "Enabling frontend site..."
ln -sf /etc/nginx/sites-available/urutibiz-frontend /etc/nginx/sites-enabled/
echo "✓ Frontend site enabled"

# Test nginx configuration
echo "Testing nginx configuration..."
if nginx -t; then
    echo "✓ Nginx configuration is valid"
    
    # Restart nginx
    echo "Restarting nginx..."
    systemctl restart nginx
    
    if systemctl is-active --quiet nginx; then
        echo "✓ Nginx restarted successfully"
        echo ""
        echo "=========================================="
        echo "Frontend nginx configuration complete!"
        echo "=========================================="
        echo ""
        echo "Your frontend is now accessible at:"
        echo "http://38.242.224.199:8080"
        echo ""
    else
        echo "✗ Failed to restart nginx"
        echo "Check logs: journalctl -xeu nginx"
        exit 1
    fi
else
    echo "✗ Nginx configuration test failed"
    echo "Please check the configuration"
    exit 1
fi
