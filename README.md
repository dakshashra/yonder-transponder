# Flight Tracker App

A React application that allows users to track flights by entering airline, flight number, and seat side information. The app makes API calls to the ADSB (Automatic Dependent Surveillance-Broadcast) API to retrieve real-time flight coordinates.

## Features

- **Multi-select airline dropdown**: Choose from 20+ major airlines
- **Flight number input**: Enter your flight number
- **Seat side selection**: Choose left, right, or center seating
- **Real-time flight tracking**: Get current latitude, longitude, altitude, speed, and heading
- **Modern UI**: Clean, responsive design with gradient backgrounds and smooth animations

## How to Use

1. **Select Airlines**: Check one or more airlines from the multi-select list
2. **Enter Flight Number**: Type your flight number (e.g., 1234)
3. **Choose Seat Side**: Select your seating preference (Left, Right, or Center)
4. **Track Flight**: Click "Track Flight" to search for real-time data

The app will try each selected airline with your flight number to find matching flight data from the ADSB API.

## API Integration

This app integrates with the [ADSB Open Data API](https://opendata.adsb.fi/api/v2/callsign/[callsign]) to fetch real-time flight information including:
- Latitude and Longitude coordinates
- Altitude
- Speed
- Heading

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

```bash
npm start
```

The app will open in your browser at [http://localhost:3000](http://localhost:3000).

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- React 19.1.1
- JavaScript (ES6+)
- CSS3 with modern features (Grid, Flexbox, Gradients)
- Fetch API for HTTP requests
- Create React App for project setup

## Notes

- The app requires an active internet connection to fetch flight data
- Flight data availability depends on the ADSB API and whether the flight is currently being tracked
- Some flights may not be available in the database if they're not actively transmitting ADS-B data

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
