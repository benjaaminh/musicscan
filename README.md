# QR-Based Music Card Generation & Scanning App

Progressive web application that generates printable QR code cards for music tracks and allows users to scan them to play music via Spotify. Built with TypeScript, Vite, React Router, and Tailwind CSS, featuring PWA capabilities for offline-first functionality.

## NOTE
The Spotify integration is in "Development Mode", which means only 5 authorized users may use the application. Submitting an application to move away from development mode can only be done by an established organization, not a private individual.

## Project Overview

Interactive music discovery and playback application designed around a hybrid local-online experience. Users can generate custom music cards from their Spotify library (if authorized), print them, and then scan the cards with their mobile device to instantly play tracks on Spotify.

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

# Screenshots

### A view of my playlists and liked playlists:
<img width="1073" height="302" alt="image" src="https://github.com/user-attachments/assets/1e4d5969-6a09-4840-9a10-a3af26ad8480" />

### Generated cards based on my playlist:
<img width="1053" height="522" alt="image" src="https://github.com/user-attachments/assets/8938b962-35c7-4430-85ee-935d053dc5ec" />

### Support for track and album search:
<img width="1077" height="598" alt="image" src="https://github.com/user-attachments/assets/3907747c-facb-459f-b7e9-38883bac3b8c" />

### Printing the cards:
<img width="953" height="811" alt="image" src="https://github.com/user-attachments/assets/ec3bae0e-f170-4d30-87ba-a36e70115805" />

### Scanning a card:
<img width="515" height="653" alt="image" src="https://github.com/user-attachments/assets/7cbd23dc-0855-40b4-a9ae-eca6e9817473" />

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
npm run lint
```
Validates code with ESLint (React hooks rules included).

### Preview
```bash
npm run preview
```
Serves production build locally for testing before deployment.

### Testing
```bash
npm run test
```
Runs the unit/integration test suite with Vitest + React Testing Library.

```bash
npm run test:watch
```
Runs unit/integration tests in watch mode during development.

```bash
npx playwright install chromium
npm run test:e2e
```
Installs Playwright browser runtime and executes end-to-end tests.

```bash
npm run test:all
```
Runs both unit/integration and end-to-end suites.

Test files are organized under:
- `tests/unit/**` for pure logic/hooks/util unit tests
- `tests/integration/**` for component/page integration tests
- `tests/e2e/**` for Playwright browser end-to-end tests
