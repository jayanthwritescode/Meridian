# Meridian - Real-time Ship Tracker

A React application that tracks real shipping vessels on a 3D interactive globe using live AIS data from AISStream.io.

## Features

- 🌍 **Interactive 3D Globe** - Real-time vessel tracking on Earth
- 🚢 **Live AIS Data** - Real-time ship positions via AISStream.io
- 📍 **Ship Selection** - Track specific vessels by name or code
- 🔄 **Auto-reconnect** - Robust WebSocket connection handling
- 🎨 **Modern UI** - Dark nautical theme with Tailwind CSS

## Tracked Vessels

- **MSC Gülsün** (MMSI: 477307900) - Ultra Large Container Vessel
- **Ever Apex** (MMSI: 352003000) - Panamax Container Vessel  
- **COSCO Fortune** (MMSI: 477211900) - Post-Panamax Container Vessel

## Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository>
   cd meridian
   npm install
   ```

2. **Get AISStream.io API Key**
   - Sign up at [AISStream.io](https://aisstream.io/)
   - Get your API key from the dashboard

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API key:
   VITE_AISSTREAM_KEY=your_actual_api_key_here
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

## Usage

1. **Select a Ship** - Click on any vessel in the sidebar or enter a ship code:
   - `MSCGULSUN` - Track MSC Gülsün
   - `EVERAPEX` - Track Ever Apex
   - `COSCOFORTUNE` - Track COSCO Fortune

2. **View Real-time Data** - The globe shows:
   - 🟢 **Live** - Connected to AIS stream
   - 🟡 **Connecting/Reconnecting** - Establishing connection
   - 🔴 **Error** - Connection issues

3. **Track Movement** - Ships update in real-time when AIS data is available

## Technology Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **react-globe.gl** - 3D globe visualization
- **Tailwind CSS** - Styling
- **AISStream.io** - Live AIS data

## API Integration

The app connects to AISStream.io WebSocket API:
- **Endpoint**: `wss://stream.aisstream.io/v0/stream`
- **Data**: Real-time vessel positions, speed, heading
- **Auto-reconnect**: Handles connection drops gracefully
- **Fallback**: Shows last known position if data is stale

## Development

```bash
# Start development server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## File Structure

```
src/
├── components/
│   ├── GlobeView.jsx      # 3D globe with AIS integration
│   └── ShipSelector.jsx   # Ship selection UI
├── data/
│   ├── ships.js           # Ship data and utilities
│   └── aisConfig.js       # AIS configuration
├── hooks/
│   └── useAISStream.js    # WebSocket AIS hook
└── App.jsx                # Main application
