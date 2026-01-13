# Spotify Setup Guide

This app uses the Spotify Web Playback SDK to play mystery tracks without revealing song information

## Prerequisites

- **Spotify Account**: Free or Premium (Premium required for full playback)
- **Spotify Developer App**: Register at [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)

## Setup Steps

### 1. Create a Spotify Developer Application

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (create one if needed)
3. Create a new app and accept the terms
4. You'll get a **Client ID**

### 2. Set Redirect URI

1. In your app settings, add a Redirect URI:
   - For local development: `http://localhost:5173`
   - For production: your actual domain

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your credentials:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173
   ```