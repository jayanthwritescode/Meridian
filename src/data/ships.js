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
  }
];

export const getShipById = (id) => SHIPS.find(ship => ship.id === id);

export const getShipByMMSI = (mmsi) => SHIPS.find(ship => ship.mmsi === mmsi.toString());

export const getShipByCode = (code) => {
  const upperCode = code.toUpperCase();
  return SHIPS.find(ship => ship.id === upperCode);
};
