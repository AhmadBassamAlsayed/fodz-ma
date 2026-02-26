/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} Radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate delivery price based on distance and config values
 * @param {number} distance - Distance in kilometers
 * @param {number} baseKm - Base distance included in base price
 * @param {number} basePrice - Price for base distance
 * @param {number} afterBasePrice - Price per km after base distance
 * @returns {number} Delivery fee
 */
const calculateDeliveryPrice = (distance, baseKm, basePrice, afterBasePrice) => {
  if (distance <= baseKm) {
    return basePrice;
  } else {
    const extraKm = distance - baseKm;
    return basePrice + (extraKm * afterBasePrice);
  }
};

module.exports = {
  calculateDistance,
  calculateDeliveryPrice
};
