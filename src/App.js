import React, { useState, useEffect, useRef } from 'react';

import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';
const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
function App() {
  const [selectedAirline, setSelectedAirline] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [seatSide, setSeatSide] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [pollingCount, setPollingCount] = useState(0);
  const [testCounter, setTestCounter] = useState(0);
  const [polygonCoords, setPolygonCoords] = useState(null);
  const [visibleLocations, setVisibleLocations] = useState([]);
  const [locationFacts, setLocationFacts] = useState({}); // Store facts for each location
  const [loadingFacts, setLoadingFacts] = useState({}); // Track loading state for facts
  //const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyC35I9cDbJmkd4wTtyfzNNm3AZ-Ba9fKD4');
 
 // const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
  // const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const dropdownRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const testIntervalRef = useRef(null);

  // Common airline codes for multi-select
  const airlines = [
    { code: 'DAL', name: 'Delta Air Lines' },
    { code: 'AAL', name: 'American Airlines' },
    { code: 'UAL', name: 'United Airlines' },
    { code: 'SWA', name: 'Southwest Airlines' },
    { code: 'ASA', name: 'Alaska Airlines' },
    { code: 'JBU', name: 'JetBlue Airways' },
    { code: 'NKS', name: 'Spirit Airlines' },
    { code: 'HAL', name: 'Hawaiian Airlines' },
    { code: 'AAY', name: 'Allegiant Air' },
    { code: 'GJS', name: 'GoJet Airlines' },
    { code: 'SKW', name: 'SkyWest Airlines' },
    { code: 'ENY', name: 'Envoy Air' },
    { code: 'MQ', name: 'Mesa Air Group' },
    { code: 'RPA', name: 'Republic Airways' },
    { code: 'PDT', name: 'Piedmont Airlines' },
    { code: 'CHQ', name: 'Compass Airlines' },
    { code: 'OO', name: 'SkyWest Airlines' },
    { code: 'EV', name: 'Envoy Air' },
    { code: 'ZK', name: 'Republic Airways (operating for American Eagle)' },
    { code: 'YX', name: 'Republic Airways (operating for Delta Connection)' },
    { code: 'OO', name: 'SkyWest Airlines' },
    { code: 'ACA', name: 'Air Canada' },
    { code: 'BAW', name: 'British Airways' },
    { code: 'DLH', name: 'Lufthansa' },
    { code: 'AFR', name: 'Air France' },
    { code: 'KLM', name: 'KLM Royal Dutch Airlines' },
    { code: 'UAE', name: 'Emirates' },
    { code: 'QTR', name: 'Qatar Airways' },
    { code: 'SIA', name: 'Singapore Airlines' },
    { code: 'CPA', name: 'Cathay Pacific' },
    { code: 'JAL', name: 'Japan Airlines' },
    { code: 'ANA', name: 'All Nippon Airways (ANA)' },
    { code: 'THY', name: 'Turkish Airlines' },
    { code: 'ETD', name: 'Etihad Airways' },
    { code: 'SWR', name: 'Swiss International Air Lines' },
    { code: 'IBE', name: 'Iberia' },
    { code: 'AUA', name: 'Austrian Airlines' },
    { code: 'AMX', name: 'Aeromexico' },
    { code: 'LAN', name: 'LATAM Airlines (Brazil)' },
    { code: 'LTM', name: 'LATAM Airlines (Chile)' },
    { code: 'QFA', name: 'Qantas Airways (Australia)' },
    { code: 'CAL', name: 'China Airlines (Taiwan)' },
    { code: 'CES', name: 'China Eastern Airlines' },
    { code: 'CSN', name: 'China Southern Airlines' },
    { code: 'KAL', name: 'Korean Air' },
    { code: 'AAR', name: 'Asiana Airlines' },
    { code: 'THA', name: 'Thai Airways' },
    { code: 'MAS', name: 'Malaysia Airlines' },
    { code: 'AIC', name: 'Air India' },
    { code: 'PIA', name: 'Pakistan International Airlines (PIA)' },
    { code: 'MSR', name: 'EgyptAir' },
    { code: 'SVA', name: 'Saudia (Saudi Arabian Airlines)' },
    { code: 'RJA', name: 'Royal Jordanian' },
    { code: 'ETH', name: 'Ethiopian Airlines' },
    { code: 'AFL', name: 'Aeroflot' },
    { code: 'TAP', name: 'TAP Air Portugal' },
    { code: 'FIN', name: 'Finnair' },
    { code: 'SAS', name: 'Scandinavian Airlines (SAS)' },
    { code: 'NAX', name: 'Norwegian Air Shuttle' }
  ];

  // National Parks data
  const national_parks = [
    ["Acadia National Park", "Maine", 44.3386, -68.2733],
    ["American Samoa National Park", "American Samoa", -14.2716, -170.7020],
    ["Arches National Park", "Utah", 38.7331, -109.5925],
    ["Badlands National Park", "South Dakota", 43.8554, -102.3397],
    ["Big Bend National Park", "Texas", 29.1275, -103.2407],
    ["Biscayne National Park", "Florida", 25.6344, -80.1587],
    ["Black Canyon of the Gunnison National Park", "Colorado", 38.5753, -107.7193],
    ["Bryce Canyon National Park", "Utah", 37.5930, -112.1871],
    ["Canyonlands National Park", "Utah", 38.3269, -109.8782],
    ["Capitol Reef National Park", "Utah", 38.3999, -111.2617],
    ["Carlsbad Caverns National Park", "New Mexico", 32.1473, -104.5565],
    ["Channel Islands National Park", "California", 34.0100, -119.4940],
    ["Congaree National Park", "South Carolina", 33.7470, -80.9381],
    ["Crater Lake National Park", "Oregon", 42.9446, -122.1090],
    ["Cuyahoga Valley National Park", "Ohio", 41.2497, -81.5512],
    ["Death Valley National Park", "California/Nevada", 36.5323, -116.9325],
    ["Denali National Park", "Alaska", 63.3274, -151.0237],
    ["Dry Tortugas National Park", "Florida", 24.6274, -82.8733],
    ["Everglades National Park", "Florida", 25.2866, -80.8987],
    ["Gates of the Arctic National Park", "Alaska", 68.2000, -152.0000],
    ["Gateway Arch National Park", "Missouri", 38.6247, -90.1848],
    ["Glacier National Park", "Montana", 48.6964, -113.7870],
    ["Grand Canyon National Park", "Arizona", 36.1069, -112.1129],
    ["Grand Teton National Park", "Wyoming", 43.7904, -110.6818],
    ["Great Basin National Park", "Nevada", 39.0133, -114.3030],
    ["Great Sand Dunes National Park", "Colorado", 37.7403, -105.7740],
    ["Great Smoky Mountains National Park", "Tennessee/North Carolina", 35.6118, -83.4895],
    ["Guadalupe Mountains National Park", "Texas", 31.8830, -104.8786],
    ["Haleakalā National Park", "Hawaii", 20.7170, -156.2540],
    ["Hawai'i Volcanoes National Park", "Hawaii", 19.4194, -155.2830],
    ["Hot Springs National Park", "Arkansas", 34.5102, -93.0540],
    ["Isle Royale National Park", "Michigan", 48.1123, -88.8327],
    ["Joshua Tree National Park", "California", 33.8734, -115.9010],
    ["Katmai National Park", "Alaska", 58.9970, -155.0815],
    ["Kenai Fjords National Park", "Alaska", 59.9677, -150.8167],
    ["Kings Canyon National Park", "California", 36.7365, -118.5550],
    ["Kobuk Valley National Park", "Alaska", 67.5500, -157.2833],
    ["Lake Clark National Park", "Alaska", 60.9744, -153.4153],
    ["Lassen Volcanic National Park", "California", 40.4977, -121.4200],
    ["Mammoth Cave National Park", "Kentucky", 37.1875, -86.1000],
    ["Mesa Verde National Park", "Colorado", 37.2308, -108.4613],
    ["Mount Rainier National Park", "Washington", 46.8796, -121.7269],
    ["New River Gorge National Park", "West Virginia", 38.0566, -81.0750],
    ["Olympic National Park", "Washington", 47.8021, -123.6044],
    ["Petrified Forest National Park", "Arizona", 35.0290, -109.7832],
    ["Redwood National and State Parks", "California", 41.2131, -124.0046],
    ["Rocky Mountain National Park", "Colorado", 40.3428, -105.6836],
    ["Saguaro National Park", "Arizona", 32.3199, -111.2518],
    ["Sequoia National Park", "California", 36.4864, -118.5658],
    ["Shenandoah National Park", "Virginia", 38.2920, -78.6793],
    ["Theodore Roosevelt National Park", "North Dakota", 46.9706, -103.4650],
    ["Virgin Islands National Park", "U.S. Virgin Islands", 18.3415, -64.7319],
    ["Voyageurs National Park", "Minnesota", 48.4653, -92.9443],
    ["Wind Cave National Park", "South Dakota", 43.6114, -103.4394],
    ["Wrangell-St. Elias National Park", "Alaska", 61.0000, -142.0000]
  ];
  

  // Major Cities data
  const major_cities = [
    ["New York", "New York", 40.7128, -74.0060],
    ["Los Angeles", "California", 34.0522, -118.2437],
    ["Chicago", "Illinois", 41.8781, -87.6298],
    ["Houston", "Texas", 29.7604, -95.3698],
    ["Phoenix", "Arizona", 33.4484, -112.0740],
    ["Philadelphia", "Pennsylvania", 39.9526, -75.1652],
    ["San Antonio", "Texas", 29.4241, -98.4936],
    ["San Diego", "California", 32.7157, -117.1611],
    ["Dallas", "Texas", 32.7767, -96.7970],
    ["San Jose", "California", 37.3382, -121.8863],
    ["Austin", "Texas", 30.2672, -97.7431],
    ["Jacksonville", "Florida", 30.3322, -81.6557],
    ["Fort Worth", "Texas", 32.7555, -97.3308],
    ["Columbus", "Ohio", 39.9612, -82.9988],
    ["Indianapolis", "Indiana", 39.7684, -86.1581],
    ["Charlotte", "North Carolina", 35.2271, -80.8431],
    ["San Francisco", "California", 37.7749, -122.4194],
    ["Seattle", "Washington", 47.6062, -122.3321],
    ["Denver", "Colorado", 39.7392, -104.9903],
    ["Washington", "District of Columbia", 38.9072, -77.0369],
    ["Boston", "Massachusetts", 42.3601, -71.0589],
    ["El Paso", "Texas", 31.7619, -106.4850],
    ["Nashville", "Tennessee", 36.1627, -86.7816],
    ["Detroit", "Michigan", 42.3314, -83.0458],
    ["Oklahoma City", "Oklahoma", 35.4676, -97.5164],
    ["Portland", "Oregon", 45.5051, -122.6750],
    ["Las Vegas", "Nevada", 36.1699, -115.1398],
    ["Memphis", "Tennessee", 35.1495, -90.0490],
    ["Louisville", "Kentucky", 38.2527, -85.7585],
    ["Baltimore", "Maryland", 39.2904, -76.6122],
    ["Milwaukee", "Wisconsin", 43.0389, -87.9065],
    ["Albuquerque", "New Mexico", 35.0844, -106.6504],
    ["Tucson", "Arizona", 32.2226, -110.9747],
    ["Fresno", "California", 36.7378, -119.7871],
    ["Mesa", "Arizona", 33.4152, -111.8315],
    ["Sacramento", "California", 38.5816, -121.4944],
    ["Atlanta", "Georgia", 33.7490, -84.3880],
    ["Kansas City", "Missouri", 39.0997, -94.5786],
    ["Colorado Springs", "Colorado", 38.8339, -104.8214],
    ["Miami", "Florida", 25.7617, -80.1918],
    ["Raleigh", "North Carolina", 35.7796, -78.6382],
    ["Omaha", "Nebraska", 41.2565, -95.9345],
    ["Long Beach", "California", 33.7701, -118.1937],
    ["Virginia Beach", "Virginia", 36.8529, -75.9780],
    ["Oakland", "California", 37.8044, -122.2712],
    ["Minneapolis", "Minnesota", 44.9778, -93.2650],
    ["Tulsa", "Oklahoma", 36.1539, -95.9928],
    ["Arlington", "Texas", 32.7357, -97.1081],
    ["New Orleans", "Louisiana", 29.9511, -90.0715],
    ["Wichita", "Kansas", 37.6872, -97.3301]
  ];

  // Famous Natural Attractions in the U.S. (mountains, lakes, rivers, waterfalls)
  const natural_attractions = [
    // Major Mountain Peaks
    ["Mount Whitney (highest in contiguous U.S.)", "California", 36.5786, -118.2914],
    ["Mount Elbert (highest in Rockies)", "Colorado", 39.1178, -106.4454],
    ["Mount Rainier", "Washington", 46.8523, -121.7603],
    ["Mount St. Helens", "Washington", 46.1912, -122.1944],
    ["Mount Hood", "Oregon", 45.3735, -121.6959],
    ["Pikes Peak", "Colorado", 38.8409, -105.0423],
    ["Mount Shasta", "California", 41.4092, -122.1949],

    // Famous Lakes
    ["Lake Tahoe", "California/Nevada", 39.0968, -120.0324],
    ["Great Salt Lake", "Utah", 41.0890, -112.2830],
    ["Lake Superior (US side)", "Minnesota/Wisconsin/Michigan", 47.7, -87.5],
    ["Lake Michigan", "Illinois/Wisconsin/Michigan/Indiana", 44.0, -87.0],
    ["Lake Erie", "Ohio/Pennsylvania/New York/Michigan", 42.2, -81.2],
    ["Lake Ontario (US side)", "New York", 43.6, -77.9],
    ["Crater Lake", "Oregon", 42.9446, -122.1090],
    ["Lake Powell", "Arizona/Utah", 37.0000, -111.5000],

    // Major Rivers
    ["Mississippi River (near New Orleans)", "Louisiana", 29.95, -90.07],
    ["Missouri River (near Kansas City)", "Missouri", 39.1, -94.6],
    ["Colorado River (near Grand Canyon)", "Arizona", 36.1069, -112.1129],
    ["Columbia River Gorge", "Oregon/Washington", 45.7253, -121.7300],
    ["Rio Grande (near El Paso)", "Texas", 31.76, -106.48],
    ["Hudson River (near New York City)", "New York", 40.7128, -74.0060],

    // Waterfalls
    ["Niagara Falls", "New York", 43.0828, -79.0742],
    ["Yosemite Falls", "California", 37.7566, -119.5967],
    ["Multnomah Falls", "Oregon", 45.5762, -122.1158],
    ["Shoshone Falls", "Idaho", 42.5931, -114.4003],
    ["Havasu Falls", "Arizona", 36.2556, -112.6975],
    ["Tahquamenon Falls", "Michigan", 46.5781, -85.2553]
  ];

  // Additional Mid-Sized U.S. Cities
  const more_cities = [
    ["Salt Lake City", "Utah", 40.7608, -111.8910],
    ["Boise", "Idaho", 43.6150, -116.2023],
    ["Anchorage", "Alaska", 61.2181, -149.9003],
    ["Juneau", "Alaska", 58.3019, -134.4197],
    ["Honolulu", "Hawaii", 21.3069, -157.8583],
    ["Charleston", "South Carolina", 32.7765, -79.9311],
    ["Savannah", "Georgia", 32.0809, -81.0912],
    ["Richmond", "Virginia", 37.5407, -77.4360],
    ["Norfolk", "Virginia", 36.8508, -76.2859],
    ["Baton Rouge", "Louisiana", 30.4515, -91.1871],
    ["Shreveport", "Louisiana", 32.5252, -93.7502],
    ["Birmingham", "Alabama", 33.5186, -86.8104],
    ["Montgomery", "Alabama", 32.3792, -86.3077],
    ["Mobile", "Alabama", 30.6954, -88.0399],
    ["Little Rock", "Arkansas", 34.7465, -92.2896],
    ["Des Moines", "Iowa", 41.5868, -93.6250],
    ["Cedar Rapids", "Iowa", 42.0083, -91.6441],
    ["Sioux Falls", "South Dakota", 43.5446, -96.7311],
    ["Fargo", "North Dakota", 46.8772, -96.7898],
    ["Bismarck", "North Dakota", 46.8083, -100.7837],
    ["Billings", "Montana", 45.7833, -108.5007],
    ["Helena", "Montana", 46.5891, -112.0391],
    ["Cheyenne", "Wyoming", 41.1400, -104.8202],
    ["Casper", "Wyoming", 42.8501, -106.3252],
    ["Albuquerque", "New Mexico", 35.0844, -106.6504],
    ["Santa Fe", "New Mexico", 35.6870, -105.9378],
    ["Spokane", "Washington", 47.6588, -117.4260],
    ["Tacoma", "Washington", 47.2529, -122.4443],
    ["Eugene", "Oregon", 44.0521, -123.0868],
    ["Salem", "Oregon", 44.9429, -123.0351],
    ["Madison", "Wisconsin", 43.0731, -89.4012],
    ["Green Bay", "Wisconsin", 44.5133, -88.0133],
    ["Grand Rapids", "Michigan", 42.9634, -85.6681],
    ["Flint", "Michigan", 43.0125, -83.6875],
    ["Toledo", "Ohio", 41.6528, -83.5379],
    ["Akron", "Ohio", 41.0814, -81.5190],
    ["Dayton", "Ohio", 39.7589, -84.1916],
    ["Buffalo", "New York", 42.8864, -78.8784],
    ["Rochester", "New York", 43.1566, -77.6088],
    ["Albany", "New York", 42.6526, -73.7562],
    ["Syracuse", "New York", 43.0481, -76.1474],
    ["Hartford", "Connecticut", 41.7658, -72.6734],
    ["New Haven", "Connecticut", 41.3083, -72.9279],
    ["Providence", "Rhode Island", 41.8240, -71.4128],
    ["Manchester", "New Hampshire", 42.9956, -71.4548],
    ["Portland", "Maine", 43.6591, -70.2568],
    ["Burlington", "Vermont", 44.4759, -73.2121],
    ["Knoxville", "Tennessee", 35.9606, -83.9207],
    ["Chattanooga", "Tennessee", 35.0456, -85.3097],
    ["Huntsville", "Alabama", 34.7304, -86.5861],
    ["Lexington", "Kentucky", 38.0406, -84.5037],
    ["Charleston", "West Virginia", 38.3498, -81.6326]
  ];
  // Make sure geminiApiKey is only declared once in the file, move this to the top-level if needed
  // const geminiApiKey = 'AIzaSyC35I9cDbJmkd4wTtyfzNNm3AZ-Ba9fKD4';

  // Function to generate educational content using Gemini AI
  const generateLocationFact = async (location) => {
    if (!geminiApiKey) {
      return "Please add your Gemini API key to get educational facts about locations!";
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      let prompt = "";
      if (location.type === 'National Park') {
        prompt = `Tell me a fascinating and educational fact about ${location.name} in ${location.state} for teenagers. Focus on how it was formed geologically, what makes it unique, wildlife that lives there, or interesting historical facts. Keep it engaging and under 150 words. Make it sound exciting and educational!`;
      } else if (location.type === 'Natural Attraction') {
        prompt = `Tell me an amazing educational fact about ${location.name} in ${location.state} for teenagers. Focus on how this natural feature was formed, what geological processes created it, or why it's scientifically significant. Keep it engaging and under 150 words. Make it exciting to learn about!`;
      } else if (location.type === 'Major City' || location.type === 'City') {
        prompt = `Tell me a cool and educational fact about ${location.name}, ${location.state} for teenagers. Focus on its history, cultural significance, famous landmarks, or interesting trivia that most people don't know. Keep it engaging and under 150 words. Make it fun to learn about!`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text || "Sorry, couldn't generate a fact right now. Try again!";
    } catch (error) {
      console.error('Error generating fact:', error);
      // More specific error handling
      if (error.message.includes('API key')) {
        return "Invalid API key. Please check your Gemini API key.";
      }
      if (error.message.includes('quota')) {
        return "API quota exceeded. Please try again later.";
      }
      return `Error generating fact: ${error.message}`;
    }
  };

  // Function to shuffle and get a new fact
  const shuffleFact = async (location) => {
    const locationKey = `${location.name}_${location.state}`;
    setLoadingFacts(prev => ({ ...prev, [locationKey]: true }));
    
    const newFact = await generateLocationFact(location);
    setLocationFacts(prev => ({ ...prev, [locationKey]: newFact }));
    setLoadingFacts(prev => ({ ...prev, [locationKey]: false }));
  };

  // Load facts for all visible locations
  const loadFactsForVisibleLocations = async (locations) => {
    if (!geminiApiKey) return;
    
    // Load facts for new locations that don't have them yet
    for (const location of locations) {
      const locationKey = `${location.name}_${location.state}`;
      if (!locationFacts[locationKey] && !loadingFacts[locationKey]) {
        setLoadingFacts(prev => ({ ...prev, [locationKey]: true }));
        
        try {
          const fact = await generateLocationFact(location);
          setLocationFacts(prev => ({ ...prev, [locationKey]: fact }));
        } catch (error) {
          console.error('Error loading fact for', location.name, ':', error);
          setLocationFacts(prev => ({ ...prev, [locationKey]: 'Error loading fact. Try again!' }));
        }
        
        setLoadingFacts(prev => ({ ...prev, [locationKey]: false }));
        
        // Add a small delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const handleAirlineSelect = (airline) => {
    setSelectedAirline(airline.code);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredAirlines.length > 0) {
      handleAirlineSelect(filteredAirlines[0]);
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  const filteredAirlines = airlines.filter(airline =>
    airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    airline.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to calculate polygon coordinates
  const calculatePolygonCoords = (lat, lon, track, seatSide) => {
    if (!lat || !lon || track === null || !seatSide) return null;

    const R = 6371; // Earth's radius in km
    const distance = 200; // 200 km
    const d = distance / R; // Angular distance

    // Convert track to radians
    const trackRad = (track * Math.PI) / 180;
    
    // Convert lat/lon to radians
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    // Determine offset direction based on seat side
    const offsetMultiplier = seatSide === 'right' ? 1 : -1;

    // Calculate offsets
    const offsets = [
      0,      // Original position
      45,     // 45 degrees
      90,     // 90 degrees  
      135     // 135 degrees
    ];

    const coords = offsets.map(offset => {
      if (offset === 0) {
        return { lat, lon };
      }

      // Calculate bearing (track + offset * direction)
      const bearing = trackRad + (offset * Math.PI / 180) * offsetMultiplier;

      // Calculate new coordinates
      const newLatRad = Math.asin(
        Math.sin(latRad) * Math.cos(d) + 
        Math.cos(latRad) * Math.sin(d) * Math.cos(bearing)
      );

      const newLonRad = lonRad + Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
        Math.cos(d) - Math.sin(latRad) * Math.sin(newLatRad)
      );

      return {
        lat: (newLatRad * 180) / Math.PI,
        lon: (newLonRad * 180) / Math.PI
      };
    });

    return coords;
  };

  // Point-in-polygon algorithm using ray casting
  const isPointInPolygon = (point, polygon) => {
    const x = point.lon;
    const y = point.lat;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lon;
      const yi = polygon[i].lat;
      const xj = polygon[j].lon;
      const yj = polygon[j].lat;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  };

  // Function to check which locations are visible from the flight
  const checkVisibleLocations = (polygon) => {
    if (!polygon || polygon.length < 3) return [];

    const visible = [];

    // Check national parks
    national_parks.forEach(park => {
      const [name, state, lat, lon] = park;
      if (isPointInPolygon({ lat, lon }, polygon)) {
        visible.push({
          name,
          state,
          lat,
          lon,
          type: 'National Park'
        });
      }
    });

    // Check major cities
    major_cities.forEach(city => {
      const [name, state, lat, lon] = city;
      if (isPointInPolygon({ lat, lon }, polygon)) {
        visible.push({
          name,
          state,
          lat,
          lon,
          type: 'Major City'
        });
      }
    });

    // Check natural attractions
    natural_attractions.forEach(attraction => {
      const [name, state, lat, lon] = attraction;
      if (isPointInPolygon({ lat, lon }, polygon)) {
        visible.push({
          name,
          state,
          lat,
          lon,
          type: 'Natural Attraction'
        });
      }
    });

    // Check additional cities
    more_cities.forEach(city => {
      const [name, state, lat, lon] = city;
      if (isPointInPolygon({ lat, lon }, polygon)) {
        visible.push({
          name,
          state,
          lat,
          lon,
          type: 'City'
        });
      }
    });

    return visible;
  };

  // Function to fetch flight data
  const fetchFlightData = async (airlineCode, flightNum) => {
    const callsign = `${airlineCode}${flightNum}`;
    // Add cache-busting timestamp to prevent caching
    const timestamp = Date.now();
    const apiUrl = `https://opendata.adsb.fi/api/v2/callsign/${callsign}?t=${timestamp}`;
    
    // Try multiple CORS proxies
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
      `https://cors-anywhere.herokuapp.com/${apiUrl}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(apiUrl)}`
    ];
    
    for (const proxyUrl of proxies) {
      try {
        console.log('Trying proxy:', proxyUrl);
        const response = await fetch(proxyUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response for', callsign, ':', data);
          
          // Check if we have flight data
          if (data && data.ac && data.ac.length > 0) {
            const flight = data.ac[0];
            if (flight.lat && flight.lon) {
              return {
                lat: flight.lat,
                lon: flight.lon,
                track: flight.track || null,
                callsign: callsign
              };
            }
          }
          
          // If we get here, no valid flight data was found
          console.log('No valid flight data found in response');
        } else {
          console.log('API Error for', callsign, 'with proxy:', response.status, response.statusText);
          const errorText = await response.text();
          console.log('Error response:', errorText);
        }
      } catch (proxyError) {
        console.log('Proxy error for', callsign, ':', proxyError.message);
        continue; // Try next proxy
      }
    }
    
    return null; // No data found
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
      }
    };
  }, []);

  // Load facts when visible locations change
  useEffect(() => {
    if (visibleLocations.length > 0) {
      loadFactsForVisibleLocations(visibleLocations);
    }
  }, [visibleLocations, geminiApiKey]);

  // Test interval to verify setInterval is working
  useEffect(() => {
    if (isPolling) {
      testIntervalRef.current = setInterval(() => {
        setTestCounter(prev => prev + 1);
        console.log('Test counter:', testCounter + 1);
      }, 2000);
    } else {
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
        testIntervalRef.current = null;
      }
      setTestCounter(0);
    }
  }, [isPolling, testCounter]);

  // Start polling function
  const startPolling = (airlineCode, flightNum) => {
    console.log('Starting polling for:', airlineCode, flightNum);
    setIsPolling(true);
    setError('');
    
    // Initial fetch
    fetchFlightData(airlineCode, flightNum).then(data => {
      if (data) {
        setFlightData(data);
        const polygon = calculatePolygonCoords(data.lat, data.lon, data.track, seatSide);
        setPolygonCoords(polygon);
        const visible = checkVisibleLocations(polygon);
        setVisibleLocations(visible);
        setError('');
      } else {
        setError(`No flight data found for ${airlineCode}${flightNum}. Polling will continue...`);
      }
    });

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      setPollingCount(prev => prev + 1);
      console.log(`Polling attempt #${pollingCount + 1} for:`, airlineCode, flightNum);
      fetchFlightData(airlineCode, flightNum).then(data => {
        if (data) {
          setFlightData(data);
          const polygon = calculatePolygonCoords(data.lat, data.lon, data.track, seatSide);
          setPolygonCoords(polygon);
          const visible = checkVisibleLocations(polygon);
          setVisibleLocations(visible);
          setError('');
          setLastUpdate(new Date().toLocaleTimeString());
          console.log('Updated flight data:', data);
        } else {
          //setError(`No flight data found for ${airlineCode}${flightNum}. Polling will continue...`);
          console.log('No flight data found in polling cycle');
        }
      }).catch(err => {
        console.error('Polling error:', err);
        setError(`Error during polling: ${err.message}. Polling will continue...`);
      });
    }, 2000); // Poll every 2 seconds
    
    console.log('Polling interval set with ID:', pollingIntervalRef.current);
  };

  // Stop polling function
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    setPollingCount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAirline || !flightNumber || !seatSide) {
      setError('Please fill in all fields');
      return;
    }

    // Stop any existing polling
    stopPolling();
    
    setLoading(true);
    setError('');
    setFlightData(null);

    // Start polling for the selected flight
    startPolling(selectedAirline, flightNumber);
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>yonder transponder</h1>
        <p>Enter your flight number and seat side to know about what you are looking at, out of the window</p>
        <p>yonder transponder turns your phone into an ADS-B transponder</p>
        
        {/* API Key Input
        <div className="api-key-section">
          <button 
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="api-key-toggle"
          >
            {geminiApiKey ? '🔑 API Key Set' : '🔑 Add Gemini API Key'}
          </button>
          
          {showApiKeyInput && (
            <div className="api-key-input">
              <input
                type="password"
                placeholder="AIzaSyC35I9cDbJmkd4wTtyfzNNm3AZ-Ba9fKD4"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="api-key-field"
              />
              <p className="api-key-help">
                Get your free API key from <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
              </p>
            </div> */}
          {/* )}
        </div> */}
      </header>
      
      <main className="App-main">
        <form onSubmit={handleSubmit} className="flight-form">
          <div className="form-group">
            <label htmlFor="airline-search">Select Airline:</label>
            <div className="dropdown-container" ref={dropdownRef}>
              <input
                type="text"
                id="airline-search"
                value={searchTerm || (selectedAirline ? airlines.find(a => a.code === selectedAirline)?.name || selectedAirline : '')}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Type to search airlines..."
                className="airline-search-input"
                autoComplete="off"
              />
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {filteredAirlines.length > 0 ? (
                    filteredAirlines.map(airline => (
                      <div
                        key={airline.code}
                        className="dropdown-item"
                        onClick={() => handleAirlineSelect(airline)}
                      >
                        <span className="airline-code">{airline.code}</span>
                        <span className="airline-name">{airline.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="dropdown-item no-results">No airlines found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="flightNumber">Flight Number:</label>
            <input
              type="text"
              id="flightNumber"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="e.g., 1234"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="seatSide">Seat Side:</label>
            <select
              id="seatSide"
              value={seatSide}
              onChange={(e) => setSeatSide(e.target.value)}
              required
            >
              <option value="">Select seat side</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          <button type="submit" disabled={loading || isPolling} className="submit-btn">
            {loading ? 'Starting...' : isPolling ? 'Tracking...' : 'Track Flight'}
          </button>
          
          {isPolling && (
            <button 
              type="button" 
              onClick={stopPolling}
              className="submit-btn"
              style={{marginTop: '10px', backgroundColor: '#dc3545'}}
            >
              Stop Tracking
            </button>
          )}
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {flightData && (
          <div className="flight-results">
            <h2>Flight Coordinates {isPolling && <span className="polling-indicator">🔄 Live</span>}</h2>
            <div className="flight-details">
              <div className="coordinates">
                <p><strong>Callsign:</strong> {flightData.callsign}</p>
                <p><strong>Latitude:</strong> {flightData.lat?.toFixed(6) || 'N/A'}</p>
                <p><strong>Longitude:</strong> {flightData.lon?.toFixed(6) || 'N/A'}</p>
                <p><strong>Track:</strong> {flightData.track !== null ? `${flightData.track}°` : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {polygonCoords && (
          <div className="polygon-results">
            <h2>Polygon Coordinates (200km from flight position)</h2>
            <div className="polygon-details">
              <p><strong>Seat Side:</strong> {seatSide}</p>
              <div className="coordinates-list">
                {polygonCoords.map((coord, index) => (
                  <div key={index} className="coord-point">
                    <strong>Point {index + 1}:</strong> 
                    <span> Lat: {coord.lat.toFixed(6)}, Lon: {coord.lon.toFixed(6)}</span>
                    {index === 0 && <span className="original-point"> (Original Position)</span>}
                    {index === 1 && <span className="offset-point"> (45° {seatSide} offset)</span>}
                    {index === 2 && <span className="offset-point"> (90° {seatSide} offset)</span>}
                    {index === 3 && <span className="offset-point"> (135° {seatSide} offset)</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {visibleLocations.length > 0 && (
          <div className="visible-locations">
            <h2>🏔️ Locations Visible from Your Flight</h2>
            <div className="locations-list">
              {visibleLocations.map((location, index) => {
                const locationKey = `${location.name}_${location.state}`;
                const fact = locationFacts[locationKey];
                const isLoadingFact = loadingFacts[locationKey];
                
                return (
                  <div key={index} className={`location-item ${location.type.toLowerCase().replace(' ', '-')}`}>
                    <div className="location-header">
                      <span className="location-name">{location.name}</span>
                      <span className="location-type">{location.type}</span>
                    </div>
                    <div className="location-details">
                      <span className="location-state">{location.state}</span>
                      <span className="location-coords">
                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                      </span>
                    </div>
                    
                    {/* Educational Fact Section */}
                    <div className="location-fact">
                      <div className="fact-header">
                        <h4>Did You Know?</h4>
                        {/* {geminiApiKey 
                          // <button
                          //   onClick={() => shuffleFact(location)}
                          //   disabled={isLoadingFact}
                          //   className="shuffle-btn"
                          //   title="Get a new fact"
                          // >
                          //   {isLoadingFact ? '⏳' : '⏳'}
                          // </button>
                        } */}
                      </div>
                      <div className="fact-content">
                        {isLoadingFact ? (
                          <p className="loading-fact">Generating an amazing fact...</p>
                        ) : fact ? (
                          <p>{fact}</p>
                        ) : !geminiApiKey ? (
                          <p className="no-api-key">Add your Gemini API key above to see fascinating facts about this location! 🔑</p>
                        ) : (
                          <p className="no-fact">Click the shuffle button to learn something cool! 🎲</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;