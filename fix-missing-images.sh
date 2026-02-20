#!/bin/bash
# Fix missing images by creating placeholder or using existing images

echo "Fixing missing image references..."
echo ""

# Create image directory
mkdir -p /var/www/html/assets/image

# Check if there are any images in the project we can use
echo "Looking for logo images in project..."
find /opt/urutibiz/urutibz-frontend -name "*.png" -o -name "*.jpg" -o -name "*.svg" 2>/dev/null | grep -i logo | head -5

echo ""
echo "Creating a simple placeholder for now..."

# Create a simple SVG placeholder logo
cat > /var/www/html/assets/image/urutilogo2.png << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#0b1220"/>
  <text x="96" y="96" font-family="Arial" font-size="48" fill="#6dbfb8" text-anchor="middle" dominant-baseline="middle">U</text>
</svg>
EOF

# Set permissions
chown -R www-data:www-data /var/www/html/assets/image/
chmod -R 755 /var/www/html/assets/image/

echo "✓ Placeholder image created"
echo ""
echo "Image folder contents:"
ls -lh /var/www/html/assets/image/
echo ""
echo "✓ Done! The site should now load without 404 errors."
echo ""
echo "Note: You should add proper logo images to:"
echo "  urutibz-frontend/public/assets/image/urutilogo2.png"
echo "Then rebuild and redeploy."
