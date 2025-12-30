// Heatmap Component
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Map, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { getHeatmapData } from '../services/superbaseConfig';
import { formatDate, formatTime, getScoreColor } from '../utils/helpers';
import { getCurrentLocation } from '../services/locationService';

const Heatmap = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '16px'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: true
  };

  useEffect(() => {
    loadHeatmapData();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setCenter({ lat: location.lat, lng: location.lng });
    } catch (err) {
      console.log('Using default location');
    }
  };

  const loadHeatmapData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHeatmapData();
      setReports(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading heatmap data:', err);
      setError('Failed to load map data. Please try again.');
      setLoading(false);
    }
  };

  const getMarkerColor = (report) => {
    if (report.type === 'street') {
      const score = report.score;
      if (score >= 80) return '#10b981'; // green
      if (score >= 60) return '#3b82f6'; // blue
      if (score >= 40) return '#f59e0b'; // yellow
      if (score >= 20) return '#f97316'; // orange
      return '#ef4444'; // red
    } else {
      return '#8b5cf6'; // purple for waste
    }
  };

  const getMarkerIcon = (report) => {
    const color = getMarkerColor(report);
    return {
      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 10
    };
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl shadow-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Map size={32} />
              <h1 className="text-2xl font-bold">Cleanliness Heatmap</h1>
            </div>
            <p className="text-purple-100">Interactive map of all reports</p>
          </div>
          <button
            onClick={loadHeatmapData}
            disabled={loading}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{reports.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Reports</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {reports.filter(r => r.type === 'street').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Street Reports</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {reports.filter(r => r.type === 'waste').length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Waste Reports</div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-purple-600" size={48} />
              <p className="text-gray-600">Loading map data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <MapPin className="text-red-600" size={24} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <LoadScript 
              googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
              onLoad={() => setMapLoaded(true)}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={13}
                options={mapOptions}
              >
                {mapLoaded && reports.map((report) => (
                  <Marker
                    key={report.id}
                    position={{ lat: report.lat, lng: report.lng }}
                    icon={getMarkerIcon(report)}
                    onClick={() => setSelectedMarker(report)}
                  />
                ))}

                {selectedMarker && (
                  <InfoWindow
                    position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-bold text-gray-800 mb-2">
                        {selectedMarker.type === 'street' ? '🛣️ Street Report' : '🗑️ Waste Report'}
                      </h3>
                      {selectedMarker.type === 'street' && (
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-semibold">Score:</span>{' '}
                            <span className={getScoreColor(selectedMarker.score).text}>
                              {selectedMarker.score}/100
                            </span>
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(selectedMarker.timestamp)} at {formatTime(selectedMarker.timestamp)}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>

            {/* Legend */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-800 mb-3">Map Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Very Clean (80-100)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Clean (60-79)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">Moderate (40-59)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-700">Dirty (20-39)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-700">Very Dirty (0-19)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-700">Waste Report</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Heatmap;