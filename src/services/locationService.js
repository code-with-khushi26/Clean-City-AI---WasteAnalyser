// Location Service - Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    // Set a longer timeout for slow GPS
    const options = {
      enableHighAccuracy: true,
      timeout: 30000, // Increased to 30 seconds
      maximumAge: 300000 // Accept cached location up to 5 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location.';
            // Provide a default location (you can change these coordinates)
            resolve({
              lat: 28.7041, // Default to Delhi, India (change to your city)
              lng: 77.1025,
              accuracy: 0,
              isDefault: true
            });
            return;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

// Quick location with fallback (doesn't wait for high accuracy)
export const getQuickLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Return default location
      resolve({
        lat: 28.7041,
        lng: 77.1025,
        accuracy: 0,
        isDefault: true
      });
      return;
    }

    const options = {
      enableHighAccuracy: false, // Faster, less accurate
      timeout: 10000,
      maximumAge: 600000 // Accept cached location up to 10 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isDefault: false
        });
      },
      (error) => {
        // On any error, use default location
        resolve({
          lat: 28.7041,
          lng: 77.1025,
          accuracy: 0,
          isDefault: true
        });
      },
      options
    );
  });
};

// Get address from coordinates (reverse geocoding)
export const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await response.json();
    
    return {
      address: data.display_name || 'Unknown location',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      country: data.address?.country || ''
    };
  } catch (error) {
    console.error('Error getting address:', error);
    return {
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: '',
      country: ''
    };
  }
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

// Helper function to convert degrees to radians
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};