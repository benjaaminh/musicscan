# QR-Based Music Card Generation & Scanning App

Progressive web application that generates printable QR code cards for music tracks and allows users to scan them to play music via Spotify. Built with TypeScript, Vite, React Router, and Tailwind CSS, featuring PWA capabilities for offline-first functionality.

## Project Overview

Interactive music discovery and playback application designed around a hybrid local-online experience. Users can generate custom music cards from their Spotify library (when enabled and subscribed to Spotify premium), print them, and then scan the cards with their mobile device to instantly play tracks on Spotify.

## Key Features

### QR Code Generation
- **Card Generation**: Create printable QR code cards from Spotify music library
- **PDF Export**: Download generated cards as PDF using html2pdf.js
- **Print Support**: Integrated print functionality for physical card production

### QR Code Scanning
- **Dual Scanning Methods**: 
  - Camera-based scanning using device camera
  - File-based scanning for uploading QR code images
- **Format Validation**: Automatic parsing and validation of Spotify track URIs

### Music Integration
- **Spotify Authentication**: OAuth 2.0 integration with proper scope management
- **Track Parsing**: Extract and validate Spotify track IDs from QR codes
- **Spotify Application-based Playback**: Seamless integration with Spotify desktop/mobile apps via `spotify:track:` URI scheme
- **Countdown UX**: Engaging countdown animation before playback initiation (togglable)

### Progressive Web App
- **Offline Support**: PWA configuration with workbox caching strategy
- **App Installation**: Installable on iOS/Android via `manifest.json`
- **Auto-Updates**: Service worker with automatic update registration
- **Responsive Design**: Mobile-first UI with full device support

---

## Technical Highlights

### Custom Hooks Architecture
- **useQRScanner**: Manages full camera initialization lifecycle, permission handling, and cleanup
- **useSpotifyAuth**: Encapsulates OAuth token management and localStorage persistence
- **useCountdown**: Reusable countdown timer with callback triggers

### Error Handling & UX
- Graceful permission denials with user-facing error messages
- Input validation for QR code formats before processing
- Fallback UI states (loading, error, success)

### Performance Optimizations
- Service worker caching strategy with workbox

### Code Quality
- Full TypeScript type coverage
- Component-level documentation via JSDoc comments
- Consistent naming conventions
- Separation of concerns (hooks, components, API layer)

---

## Run it locally:

### Prerequisites
- Node.js 18+ with npm/yarn
- Modern browser with WebRTC support (for camera scanning)

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Starts Vite dev server with hot module replacement. Supports mobile device testing via ngrok tunneling.

### Build
```bash
npm run build
```
Compiles TypeScript and optimizes assets with tree-shaking for production.

### Linting
```bash
npm lint
```
Validates code with ESLint (React hooks rules included).

### Preview
```bash
npm run preview
```
Serves production build locally for testing before deployment.