#!/bin/bash
# Deployment Diagnostic Script

echo "=========================================="
echo "Frontend Deployment Diagnostics"
echo "=========================================="
echo ""

echo "1. Checking /var/www/html/ contents:"
echo "-----------------------------------"
ls -lah /var/www/html/
echo ""

echo "2. Checking if index.html exists:"
echo "-----------------------------------"
if [ -f /var/www/html/index.html ]; then
    echo "✓ index.html found"
    echo "Size: $(du -h /var/www/html/index.html | cut -f1)"
else
    echo "✗ index.html NOT found!"
fi
echo ""

echo "3. Checking assets folder:"
echo "-----------------------------------"
if [ -d /var/www/html/assets ]; then
    echo "✓ assets folder found"
    echo "Contents:"
    ls -lh /var/www/html/assets/ | head -10
else
    echo "✗ assets folder NOT found!"
fi
echo ""

echo "4. Checking dist folder (source):"
echo "-----------------------------------"
if [ -d /opt/urutibiz/urutibz-frontend/dist ]; then
    echo "✓ dist folder exists"
    ls -lah /opt/urutibiz/urutibz-frontend/dist/
else
    echo "✗ dist folder NOT found - need to run 'npm run build'"
fi
echo ""

echo "5. Checking nginx configuration:"
echo "-----------------------------------"
nginx -t
echo ""

echo "6. Checking nginx is running:"
echo "-----------------------------------"
systemctl status nginx --no-pager | head -5
echo ""

echo "7. Checking port 8080:"
echo "-----------------------------------"
netstat -tulpn | grep :8080
echo ""

echo "8. Testing local access:"
echo "-----------------------------------"
curl -I http://localhost:8080 2>&1 | head -10
echo ""

echo "=========================================="
echo "Diagnostic Complete"
echo "=========================================="
