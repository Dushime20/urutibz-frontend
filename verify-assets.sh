#!/bin/bash
# Verify all assets exist

echo "Checking if required assets exist..."
echo ""

echo "1. Checking main JS file:"
if ls /var/www/html/assets/index-*.js 1> /dev/null 2>&1; then
    echo "✓ Found: $(ls /var/www/html/assets/index-*.js)"
else
    echo "✗ Main JS file NOT found!"
fi
echo ""

echo "2. Checking CSS files:"
if ls /var/www/html/assets/*.css 1> /dev/null 2>&1; then
    echo "✓ Found CSS files:"
    ls -lh /var/www/html/assets/*.css
else
    echo "✗ CSS files NOT found!"
fi
echo ""

echo "3. Checking image folder:"
if [ -d /var/www/html/assets/image ]; then
    echo "✓ Image folder exists"
    ls -lh /var/www/html/assets/image/
else
    echo "✗ Image folder NOT found!"
    echo "Creating image folder and checking source..."
    
    # Check if images exist in source
    if [ -d /opt/urutibiz/urutibz-frontend/public/assets/image ]; then
        echo "Found images in public folder, copying..."
        mkdir -p /var/www/html/assets/image
        cp -r /opt/urutibiz/urutibz-frontend/public/assets/image/* /var/www/html/assets/image/
        chown -R www-data:www-data /var/www/html/assets/image/
        echo "✓ Images copied"
    else
        echo "✗ Images not found in public folder either!"
    fi
fi
echo ""

echo "4. All files in assets folder:"
ls -lh /var/www/html/assets/ | head -20
echo ""

echo "5. Testing specific file from HTML:"
echo "Checking: /var/www/html/assets/index-j_Q68cru.js"
if [ -f /var/www/html/assets/index-j_Q68cru.js ]; then
    echo "✓ File exists"
    ls -lh /var/www/html/assets/index-j_Q68cru.js
else
    echo "✗ File NOT found - checking for similar files:"
    ls -lh /var/www/html/assets/index-*.js 2>/dev/null || echo "No index-*.js files found"
fi
echo ""

echo "6. Testing image file:"
echo "Checking: /var/www/html/assets/image/urutilogo2.png"
if [ -f /var/www/html/assets/image/urutilogo2.png ]; then
    echo "✓ Logo exists"
    ls -lh /var/www/html/assets/image/urutilogo2.png
else
    echo "✗ Logo NOT found"
fi
echo ""

echo "7. Testing file access via curl:"
curl -I http://localhost:8080/assets/index-j_Q68cru.js 2>&1 | head -5
echo ""

echo "Done!"
