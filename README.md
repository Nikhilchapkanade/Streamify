# 🎵 Streamify

Streamify is a premium, modern, cross-platform music streaming application built with **React Native (Expo)** and powered by a **FastAPI Python backend**. It brings together your personal **Spotify library** and streams audio content from **YouTube Music** with advanced features like SponsorBlock, synchronized scrolling lyrics, and offline caching.

---

## 🌟 Key Features

*   **Spotify Sync:** Log in with your Spotify account (using client-side Implicit Grant OAuth) to synchronize your playlists, liked tracks, and library directly into the app. (No Spotify Premium required!)
*   **YouTube Music Audio Streaming:** Queries YouTube's catalog and streams high-quality audio files using a round-robin connection pool of public, privacy-friendly Piped API instances.
*   **SponsorBlock Integration:** Automatically skips non-music segments of YouTube audio streams (e.g. skits, talking intros, outro cards, and sponsored messages).
*   **Synchronized Scrolling Lyrics:** Fetches synchronized `.lrc` lyrics from the open **LRCLIB API** and scrolls them in real-time, highlighting the current line as the track plays.
*   **Offline Caching:** Automatically downloads and caches streamed tracks using `expo-file-system` for instant playback and offline usage.

---

## 📁 Repository Structure

The project is structured as a monorepo containing both the mobile app and the backend service:

```text
├── backend/               # FastAPI Python service (deployed to Render)
│   ├── main.py            # YouTube search and stream URL extraction API (via yt-dlp)
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Docker configuration for Render
├── app/                   # Expo React Native mobile application
│   ├── (tabs)/            # Main app tabs (Home, Explore, Library)
│   ├── (auth)/            # Auth screens (Login, Signup)
│   ├── lyrics.tsx         # Fullscreen synchronized lyrics viewer
│   └── _layout.tsx        # Navigation stack configuration
├── context/               # React Context Providers (PlayerContext, SpotifyContext)
├── services/              # API and integrations (Lyrics, SponsorBlock, YouTube)
├── utils/                 # Utility files (CacheManager)
├── app.json               # Expo app configuration
├── package.json           # React Native dependencies
└── requirements.txt       # Backend dependencies (at root for Render deployment)
```

---

## 🚀 Getting Started

### 📱 1. Mobile Application (React Native / Expo)

#### Prerequisites
Make sure you have Node.js and the Expo Go app (or Android Emulator/iOS Simulator) installed.

#### Installation
1. Install the node packages:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code with your phone via the **Expo Go** app, or press `a` for Android / `i` for iOS to start the simulator.

---

### ⚙️ 2. Backend API (FastAPI)

The backend is deployed to **Render** and handles YouTube stream extraction using `yt-dlp`.

#### Running Locally
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *The server will run on `http://127.0.0.1:8000`.*

---

## 📦 Building the APK (Android)

Your `eas.json` is pre-configured to output an APK for your device.

1. Install the EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Build the APK:
   ```bash
   eas build --platform android --profile preview
   ```
   *EAS will compile the project and provide a download link or QR code once complete.*
