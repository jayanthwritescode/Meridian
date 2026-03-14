// AIS vessel MMSI numbers for our tracked ships
export const VESSEL_MMSI = {
  'MSCGULSUN': '477307900',
  'EVERAPEX': '352003000', 
  'COSCOFORTUNE': '477211900'
};

// Get MMSI list for AIS stream
export const getMMSIList = () => Object.values(VESSEL_MMSI);

// Get ship ID from MMSI
export const getShipIdFromMMSI = (mmsi) => {
  for (const [shipId, shipMMSI] of Object.entries(VESSEL_MMSI)) {
    if (shipMMSI === mmsi.toString()) {
      return shipId;
    }
  }
  return null;
};
