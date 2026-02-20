#!/bin/bash
# Fix 404 errors - Complete rebuild and redeploy

echo "=========================================="
echo "Fixing 404 Errors"
echo "=========================================="
echo ""

cd /opt/urutibiz/urutibz-frontend

echo "1. Cleaning old build..."
rm -rf dist/
rm -rf node_modules/.vite
echo "✓ Cleaned"
echo ""

echo "2. Checking .env configuration..."
cat .env
echo ""

echo "3. Building fresh production version..."
npm run build
if [ $? -eq 0 ]; then
    echo "✓ Build successful"
else
    echo "✗ Build failed!"
    exit 1
fi
echo ""

echo "4. Clearing web root..."
rm -rf /var/www/html/*
echo "✓ Cleared"
echo ""

echo "5. Deploying fresh build..."
cp -r dist/* /var/www/html/
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/
echo "✓ Deployed"
echo ""

echo "6. Verifying deployment..."
echo "Files in /var/www/html/:"
ls -lh /var/www/html/
echo ""

echo "7. Checking assets folder..."
if [ -d /var/www/html/assets ]; then
    echo "✓ Assets folder exists"
    echo "Number of files: $(ls -1 /var/www/html/assets/ | wc -l)"
else
    echo "✗ Assets folder missing!"
fi
echo ""

echo "8. Testing index.html..."
if [ -f /var/www/html/index.html ]; then
    echo "✓ index.html exists"
    echo "First few lines:"
    head -5 /var/www/html/index.html
else
    echo "✗ index.html missing!"
fi
echo ""

echo "9. Restarting nginx..."
systemctl restart nginx
sleep 2
echo "✓ Nginx restarted"
echo ""

echo "10. Testing access..."
curl -I http://localhost:8080
echo ""

echo "=========================================="
echo "Fix Complete!"
echo "=========================================="
echo ""
echo "Now try accessing in browser:"
echo "http://38.242.224.199:8080"
echo ""
echo "If still getting 404:"
echo "1. Clear browser cache (Ctrl+Shift+Delete)"
echo "2. Try incognito/private mode"
echo "3. Check browser console (F12) for specific file causing 404"
echo ""
