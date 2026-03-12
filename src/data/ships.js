export const SHIPS = [
  { 
    id: 'MSCGULSUN', 
    name: 'MSC Gülsün',
    mmsi: '477307900',
    lat: 31.2, 
    lon: 121.5, 
    color: '#3b82f6',
    description: 'Ultra Large Container Vessel',
    flag: 'Panama'
  },
  { 
    id: 'EVERAPEX', 
    name: 'Ever Apex',
    mmsi: '352003000',
    lat: 33.7, 
    lon: -118.2, 
    color: '#f59e0b',
    description: 'Panamax Container Vessel',
    flag: 'Liberia'
  },
  { 
    id: 'COSCOFORTUNE', 
    name: 'COSCO Fortune',
    mmsi: '477211900',
    lat: -23.9, 
    lon: -46.3, 
    color: '#a855f7',
    description: 'Post-Panamax Container Vessel',
    flag: 'Hong Kong'
  },
  { 
    id: 'MSCELBE', 
    name: 'MSC Elbe',
    mmsi: '636092045',
    lat: 53.5461, 
    lon: 9.9669, 
    color: '#06b6d4',
    description: 'Large Container Vessel',
    flag: 'Germany'
  },
  { 
    id: 'OOCLARABIA', 
    name: 'OOCL Arabia',
    mmsi: '477334300',
    lat: 25.0657, 
    lon: 55.1713, 
    color: '#10b981',
    description: 'Feeder Container Vessel',
    flag: 'Hong Kong'
  },
  { 
    id: 'COSCOAFRICA', 
    name: 'COSCO Africa',
    mmsi: '477219600',
    lat: 22.5431, 
    lon: 113.8010, 
    color: '#f97316',
    description: 'Large Container Vessel',
    flag: 'China'
  },
  { 
    id: 'EVERGLOBE', 
    name: 'Ever Globe',
    mmsi: '352003100',
    lat: 35.4437, 
    lon: 139.6380, 
    color: '#ec4899',
    description: 'Large Container Vessel',
    flag: 'Taiwan'
  },
  { 
    id: 'ANLBINDAREE', 
    name: 'ANL Bindaree',
    mmsi: '503000001',
    lat: 1.3521, 
    lon: 103.8198, 
    color: '#14b8a6',
    description: 'Panamax Container Vessel',
    flag: 'France'
  }
];

export const getShipById = (id) => SHIPS.find(ship => ship.id === id);

export const getShipByMMSI = (mmsi) => SHIPS.find(ship => ship.mmsi === mmsi.toString());

export const getShipByCode = (code) => {
  const upperCode = code.toUpperCase();
  return SHIPS.find(ship => ship.id === upperCode);
};
