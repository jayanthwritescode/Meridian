export const vessels = [
  {
    id: '477307900',
    name: 'MSC Gülsün',
    mmsi: '477307900',
    carrier: 'MSC Mediterranean',
    route: {
      name: 'Shanghai → Rotterdam',
      origin: { lat: 31.2, lon: 121.5, name: 'Shanghai' },
      destination: { lat: 51.9, lon: 4.5, name: 'Rotterdam' },
      waypoints: [
        { lat: 24.5, lon: 121.0, name: 'Taiwan Strait' },
        { lat: 1.3, lon: 103.8, name: 'Strait of Malacca' },
        { lat: -5.0, lon: 72.0, name: 'Indian Ocean' },
        { lat: 30.0, lon: 32.5, name: 'Suez Canal' },
        { lat: 36.0, lon: 14.0, name: 'Mediterranean' }
      ]
    },
    cargo: 'Electronics, Textiles, Auto Parts',
    teu: 21000,
    co2: 1840,
    distance: 19550,
    depart: '2026-03-01',
    eta: '2026-04-08',
    progress: 0.62,
    color: '#3b82f6',
    status: 'active',
    facts: [
      'Can carry 21,000 TEU - equivalent to 44 million pairs of shoes',
      'Length: 399.9 meters, longer than 4 football fields',
      'Crew of 27 from 12 different nations',
      'Burns 80 tons of heavy fuel per day at sea'
    ]
  },
  {
    id: '352003000',
    name: 'Ever Apex',
    mmsi: '352003000',
    carrier: 'Evergreen Line',
    route: {
      name: 'Los Angeles → Tokyo',
      origin: { lat: 33.7, lon: -118.2, name: 'Los Angeles' },
      destination: { lat: 35.6, lon: 139.7, name: 'Tokyo' },
      waypoints: [
        { lat: 35.0, lon: -160.0, name: 'Mid Pacific' },
        { lat: 36.0, lon: 180.0, name: 'Date Line' },
        { lat: 35.0, lon: 160.0, name: 'Western Pacific' }
      ]
    },
    cargo: 'Soybeans, Cotton, Medical Devices',
    teu: 8400,
    co2: 920,
    distance: 8760,
    depart: '2026-03-10',
    eta: '2026-03-29',
    progress: 0.35,
    color: '#f59e0b',
    status: 'active',
    facts: [
      'Crosses the International Date Line twice per round trip',
      'One of the most fuel-efficient vessels in the fleet',
      'Uses low-sulfur fuel to meet emissions standards',
      'Automated cargo handling reduces turnaround time by 40%'
    ]
  },
  {
    id: '477211900',
    name: 'COSCO Fortune',
    mmsi: '477211900',
    carrier: 'COSCO Shipping',
    route: {
      name: 'Santos → Antwerp',
      origin: { lat: -23.9, lon: -46.3, name: 'Santos' },
      destination: { lat: 51.3, lon: 4.4, name: 'Antwerp' },
      waypoints: [
        { lat: -15.0, lon: -25.0, name: 'South Atlantic' },
        { lat: 0.0, lon: -15.0, name: 'Equator' },
        { lat: 35.0, lon: -20.0, name: 'North Atlantic' },
        { lat: 50.0, lon: -2.0, name: 'English Channel' }
      ]
    },
    cargo: 'Coffee, Iron Ore, Soybeans',
    teu: 12800,
    co2: 1240,
    distance: 10200,
    depart: '2026-02-20',
    eta: '2026-03-18',
    progress: 0.78,
    color: '#a855f7',
    status: 'delayed',
    delay: '+3 days, North Atlantic storms',
    facts: [
      'One of the largest vessels serving South America-Europe trade',
      'Ice-class reinforced hull for North Atlantic conditions',
      'Carries enough coffee for 3 million cups per day',
      'Delayed by 3 days due to unprecedented North Atlantic storm season'
    ]
  }
];

export const globalFacts = [
  '90% of everything you own has traveled by ship',
  '50,000 merchant ships at sea right now',
  'Sea freight emits 50× less CO₂ than air',
  'One supertanker takes 5km to stop',
  'The global fleet would circle Earth 3 times',
  '11 billion tonnes shipped every year',
  'A single container ship can carry 20,000 containers',
  'Shipping handles 90% of global trade by volume',
  'The Panama Canal saves 8,000 nautical miles per journey',
  'Modern ships use GPS accurate to within 3 meters'
];

export const ports = [
  { lat: 31.2, lon: 121.5, name: 'Shanghai', size: 1.5 },
  { lat: 51.9, lon: 4.5, name: 'Rotterdam', size: 1.5 },
  { lat: 33.7, lon: -118.2, name: 'Los Angeles', size: 1.5 },
  { lat: 35.6, lon: 139.7, name: 'Tokyo', size: 1.5 },
  { lat: -23.9, lon: -46.3, name: 'Santos', size: 1.5 },
  { lat: 51.3, lon: 4.4, name: 'Antwerp', size: 1.5 },
  { lat: 24.5, lon: 121.0, name: 'Taiwan Strait', size: 1.0 },
  { lat: 1.3, lon: 103.8, name: 'Strait of Malacca', size: 1.0 },
  { lat: -5.0, lon: 72.0, name: 'Indian Ocean', size: 1.0 },
  { lat: 30.0, lon: 32.5, name: 'Suez Canal', size: 1.0 },
  { lat: 36.0, lon: 14.0, name: 'Mediterranean', size: 1.0 },
  { lat: 35.0, lon: -160.0, name: 'Mid Pacific', size: 1.0 },
  { lat: 36.0, lon: 180.0, name: 'Date Line', size: 1.0 },
  { lat: 35.0, lon: 160.0, name: 'Western Pacific', size: 1.0 },
  { lat: -15.0, lon: -25.0, name: 'South Atlantic', size: 1.0 },
  { lat: 0.0, lon: -15.0, name: 'Equator', size: 1.0 },
  { lat: 35.0, lon: -20.0, name: 'North Atlantic', size: 1.0 },
  { lat: 50.0, lon: -2.0, name: 'English Channel', size: 1.0 }
];

export const getRoutesData = (vessels) => {
  return vessels.map(vessel => ({
    ...vessel.route,
    color: vessel.color,
    originLat: vessel.route.origin.lat,
    originLng: vessel.route.origin.lon,
    destinationLat: vessel.route.destination.lat,
    destinationLng: vessel.route.destination.lon
  }));
};
