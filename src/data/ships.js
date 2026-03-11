export const SHIPS = [
  { 
    id: 'MSCGULSUN', 
    name: 'MSC Gülsün',
    lat: 31.2, 
    lon: 121.5, 
    color: '#3b82f6',
    description: 'Ultra Large Container Vessel'
  },
  { 
    id: 'EVERAPEX', 
    name: 'Ever Apex',
    lat: 33.7, 
    lon: -118.2, 
    color: '#f59e0b',
    description: 'Panamax Container Vessel'
  },
  { 
    id: 'COSCOFORTUNE', 
    name: 'COSCO Fortune',
    lat: -23.9, 
    lon: -46.3, 
    color: '#a855f7',
    description: 'Post-Panamax Container Vessel'
  }
];

export const getShipById = (id) => SHIPS.find(ship => ship.id === id);

export const getShipByCode = (code) => {
  const upperCode = code.toUpperCase();
  return SHIPS.find(ship => ship.id === upperCode);
};
