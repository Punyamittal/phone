"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HeatMapLayer from "./HeatMapComponent";
import HeatMapLegend from "./HeatMapLegend";
import { HealthHeatPoint } from "./data/healthData";

// Interface for map locations
interface MapLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "hospital" | "clinic" | "pharmacy";
}

// Props for the map component
interface MapComponentProps {
  locations: MapLocation[];
  userLocation: [number, number] | null;
  selectedLocation: MapLocation | null;
  onLocationSelect: (location: MapLocation) => void;
  // Heat map props
  showHeatMap: boolean;
  heatMapType: string;
  heatMapData: HealthHeatPoint[];
  heatMapGradient?: { [key: string]: string };
}

// Component to handle flying to a location
function FlyToLocation({ location }: { location: MapLocation | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 15, {
        duration: 1.5, // Animation duration in seconds
      });
    }
  }, [location, map]);
  
  return null;
}

// Component to handle flying to user location
function FlyToUserLocation({ location }: { location: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.flyTo(location, 14, {
        duration: 1.5, // Animation duration in seconds
      });
    }
  }, [location, map]);
  
  return null;
}

// Component to ensure map view is optimal for heat map visibility
function OptimizeMapForHeatMap({ isActive, points }: { isActive: boolean, points: HealthHeatPoint[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (isActive && points.length > 0) {
      // Calculate the bounds of the heat map data
      let minLat = Number.MAX_VALUE;
      let maxLat = Number.MIN_VALUE;
      let minLng = Number.MAX_VALUE;
      let maxLng = Number.MIN_VALUE;
      
      points.forEach(point => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLng = Math.min(minLng, point.lng);
        maxLng = Math.max(maxLng, point.lng);
      });
      
      // Create a bounds object and fit the map to it
      const bounds = L.latLngBounds(
        L.latLng(minLat, minLng),
        L.latLng(maxLat, maxLng)
      );
      
      // Add some padding to the bounds
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
        animate: true,
        duration: 1.0
      });
      
      // Force a redraw after a slight delay to ensure everything renders
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [isActive, points, map]);
  
  return null;
}

// Get legend title based on heat map type
const getLegendTitle = (type: string): string => {
  switch(type) {
    case 'covid': return 'COVID-19 Cases';
    case 'flu': return 'Flu Cases';
    case 'healthcare_access': return 'Healthcare Access';
    default: return 'Health Data';
  }
};

// Get legend labels based on heat map type
const getLegendLabels = (type: string): string[] => {
  switch(type) {
    case 'covid': return ['Low', 'Moderate', 'High', 'Critical'];
    case 'flu': return ['Low', 'Moderate', 'High', 'Severe'];
    case 'healthcare_access': return ['Poor', 'Limited', 'Good', 'Excellent'];
    default: return ['Low', 'Medium', 'High'];
  }
};

export default function MapComponent({ 
  locations, 
  userLocation, 
  selectedLocation,
  onLocationSelect,
  showHeatMap,
  heatMapType,
  heatMapData,
  heatMapGradient
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Fix Leaflet icon issue in Next.js
  useEffect(() => {
    // Only run this code on the client side
    if (typeof window !== "undefined") {
      // This is needed to fix the marker icon issue with Leaflet in Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      });
    }
  }, []);

  // Custom marker icons based on location type
  const getMarkerIcon = (type: "hospital" | "clinic" | "pharmacy") => {
    let iconUrl = "";
    let iconSize: [number, number] = [25, 25];
    
    // In a real app, you'd have actual icon files for each type
    switch (type) {
      case "hospital":
        // Using a colored marker for hospitals
        iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
        break;
      case "clinic":
        // Using the same marker for clinics for simplicity
        iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
        break;
      case "pharmacy":
        // Using the same marker for pharmacies for simplicity
        iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
        break;
    }
    
    return new L.Icon({
      iconUrl,
      iconSize,
      iconAnchor: [12, 25],
      popupAnchor: [0, -25],
    });
  };

  // Set map ready state after rendering
  useEffect(() => {
    if (mapRef.current) {
      setMapReady(true);
    }
  }, [mapRef.current]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[28.6139, 77.2090]} // New Delhi, India coordinates
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Component to handle flying to locations */}
        {selectedLocation && <FlyToLocation location={selectedLocation} />}
        {userLocation && <FlyToUserLocation location={userLocation} />}
        
        {/* Heat map optimization component */}
        {mapReady && showHeatMap && heatMapData.length > 0 && (
          <OptimizeMapForHeatMap isActive={showHeatMap} points={heatMapData} />
        )}
        
        {/* Heat map layer */}
        {mapReady && heatMapData && heatMapData.length > 0 && (
          <HeatMapLayer
            points={heatMapData}
            isVisible={showHeatMap}
            gradient={heatMapGradient}
            radius={30}
            blur={20}
            maxIntensity={1.0}
          />
        )}
        
        {/* User location marker */}
        {userLocation && (
          <>
            <Marker 
              position={userLocation}
              icon={new L.Icon({
                iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                shadowSize: [41, 41],
              })}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-bold">Your Location</div>
                </div>
              </Popup>
            </Marker>
            <Circle 
              center={userLocation}
              radius={1000}
              pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue', weight: 1 }}
            />
          </>
        )}
        
        {/* Healthcare locations markers */}
        {locations.map((location) => (
          <Marker 
            key={location.id}
            position={[location.lat, location.lng]}
            icon={getMarkerIcon(location.type)}
            eventHandlers={{
              click: () => onLocationSelect(location),
            }}
          >
            <Popup>
              <div className="p-1">
                <div className="font-bold">{location.name}</div>
                <div className="text-sm">{location.address}</div>
                <div className="text-xs mt-1 capitalize">Type: {location.type}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Heat map legend */}
      {heatMapGradient && (
        <HeatMapLegend
          title={getLegendTitle(heatMapType)}
          gradient={heatMapGradient}
          isVisible={showHeatMap}
          legendLabels={getLegendLabels(heatMapType)}
        />
      )}
    </div>
  );
} 