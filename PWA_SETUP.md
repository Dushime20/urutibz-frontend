# Progressive Web App (PWA) Setup Guide

## Overview

Uruti eRental is now configured as a Progressive Web App (PWA), allowing users to install it on both desktop and mobile devices for a native app-like experience.

## Features

### ✅ What's Included

1. **Web App Manifest** - Defines how the app appears when installed
2. **Service Worker** - Enables offline functionality and caching
3. **Install Prompt** - Automatic prompts for desktop and mobile users
4. **App Icons** - Custom icons for home screen/bookmarks
5. **Offline Support** - Basic offline functionality with caching

## Installation Methods

### Desktop Users (Chrome, Edge, Firefox)

1. **Automatic Prompt**: Users will see an install banner after visiting the site
2. **Manual Installation**:
   - **Chrome/Edge**: Click the install icon in the address bar
   - **Firefox**: Click the install icon in the address bar
   - **Safari**: Not supported (macOS only)

### Mobile Users

#### iOS (Safari)
1. Tap the Share button (□↑) at the bottom of Safari
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm
4. The app will appear on your home screen

#### Android (Chrome)
1. **Automatic Prompt**: Users will see an install banner
2. **Manual Installation**:
   - Tap the menu (three dots) in Chrome
   - Select "Add to Home screen" or "Install app"
   - Confirm installation

## Technical Details

### Service Worker

The service worker provides:
- **Offline caching** of static assets
- **API response caching** (5-minute expiration)
- **Image caching** (30-day expiration)
- **Automatic updates** when new versions are available

### Manifest Configuration

Located in `vite.config.ts`, the manifest includes:
- App name and description
- Theme colors
- Icons (192x192 and 512x512)
- Display mode (standalone)
- Shortcuts for quick access

### Install Prompt Component

The `PWAInstallPrompt` component:
- Detects when the app can be installed
- Shows platform-specific instructions
- Remembers if user dismissed the prompt (7-day cooldown)
- Automatically hides if app is already installed

## Development

### Testing PWA Features

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Preview the build**:
   ```bash
   npm run preview
   ```

3. **Test installation**:
   - Open in Chrome/Edge
   - Open DevTools → Application tab
   - Check "Service Workers" and "Manifest"
   - Test install prompt

### Testing on Mobile

1. **Local Network Testing**:
   - Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Access from mobile: `http://YOUR_IP:5173`
   - Ensure both devices are on the same network

2. **HTTPS Requirement**:
   - PWAs require HTTPS in production
   - Local development works with HTTP
   - Use a service like ngrok for HTTPS testing

## Customization

### Changing App Icons

1. Replace `/public/assets/image/urutilogo2.png` with your icons
2. Recommended sizes:
   - 192x192px (minimum)
   - 512x512px (recommended)
   - 180x180px (iOS)

3. Update icon paths in `vite.config.ts` if needed

### Modifying Install Prompt

Edit `src/components/PWAInstallPrompt.tsx` to:
- Change prompt timing
- Customize appearance
- Modify dismissal behavior
- Add analytics tracking

### Cache Configuration

Modify cache strategies in `vite.config.ts` under `workbox.runtimeCaching`:
- **NetworkFirst**: For API calls (always try network first)
- **CacheFirst**: For static assets (images, fonts, etc.)

## Production Deployment

### Requirements

1. **HTTPS**: PWAs require HTTPS (except localhost)
2. **Valid SSL Certificate**: Ensure your domain has a valid certificate
3. **Service Worker Scope**: Must be served from root or subdirectory

### Build Process

```bash
npm run build
```

The build process will:
- Generate service worker files
- Create manifest.json
- Optimize assets for caching
- Generate precache manifest

### Deployment Checklist

- [ ] Verify HTTPS is enabled
- [ ] Test install prompt on desktop
- [ ] Test install prompt on mobile (iOS and Android)
- [ ] Verify service worker is registered
- [ ] Test offline functionality
- [ ] Check app icons display correctly
- [ ] Verify manifest.json is accessible

## Troubleshooting

### Install Prompt Not Showing

1. **Check if already installed**: The prompt won't show if the app is already installed
2. **Clear browser data**: Clear site data and reload
3. **Check browser support**: Ensure you're using a supported browser
4. **Check HTTPS**: PWAs require HTTPS in production

### Service Worker Not Registering

1. **Check console errors**: Look for service worker errors in DevTools
2. **Verify build**: Ensure you've run `npm run build`
3. **Check scope**: Service worker must be in root or parent directory
4. **Clear cache**: Clear browser cache and reload

### Icons Not Displaying

1. **Check file paths**: Verify icon paths in manifest
2. **Check file sizes**: Ensure icons meet minimum size requirements
3. **Check file format**: Use PNG format for best compatibility
4. **Clear cache**: Clear browser cache and reinstall

## Browser Support

| Browser | Desktop | Mobile | Install Prompt |
|---------|---------|--------|----------------|
| Chrome  | ✅      | ✅     | ✅             |
| Edge    | ✅      | ✅     | ✅             |
| Firefox | ✅      | ✅     | ✅             |
| Safari  | ⚠️      | ✅     | ❌ (Manual)    |
| Opera   | ✅      | ✅     | ✅             |

## Additional Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA Guide](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin Docs](https://vite-pwa-org.netlify.app/)

## Support

For issues or questions about the PWA implementation, please refer to the main project documentation or contact the development team.

