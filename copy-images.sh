#!/bin/bash
# Copy public images to deployment folder

echo "Copying images to web root..."

# Check if public/assets exists
if [ -d "/opt/urutibiz/urutibz-frontend/public/assets" ]; then
    echo "✓ Found public/assets folder"
    
    # Create assets folder in web root if it doesn't exist
    mkdir -p /var/www/html/assets
    
    # Copy all public assets
    cp -r /opt/urutibiz/urutibz-frontend/public/assets/* /var/www/html/assets/
    
    # Set permissions
    chown -R www-data:www-data /var/www/html/assets/
    chmod -R 755 /var/www/html/assets/
    
    echo "✓ Images copied successfully"
    echo ""
    echo "Checking what was copied:"
    ls -lh /var/www/html/assets/
    
else
    echo "✗ public/assets folder not found!"
    echo "Checking what's in public folder:"
    ls -la /opt/urutibiz/urutibz-frontend/public/
fi

echo ""
echo "Done!"
