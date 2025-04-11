"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface HeatMapProps {
  points: HeatPoint[];
  radius?: number;
  maxIntensity?: number;
  blur?: number;
  gradient?: { [key: string]: string };
  isVisible: boolean;
}

export default function HeatMapLayer({
  points,
  radius = 30,
  maxIntensity = 1.0,
  blur = 20,
  gradient = { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' },
  isVisible
}: HeatMapProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  // Enhance intensity for better visibility
  // Prepare the points for the heat layer with higher base intensity
  const heatPoints = points.map(point => {
    // Scale up the intensity to make it more visible
    const intensity = point.intensity ? Math.min(point.intensity * 1.5, 1.0) : 0.7; 
    return [point.lat, point.lng, intensity] as [number, number, number];
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clean up any existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (isVisible && points.length > 0) {
      // Check that required functions exist on L
      if (typeof L.heatLayer !== 'function') {
        console.error('L.heatLayer is not a function. Leaflet.heat may not be properly loaded.');
        return;
      }

      try {
        // Create and add a new heat layer with improved visibility
        const heatLayer = L.heatLayer(heatPoints, {
          radius,
          blur,
          maxZoom: 18,
          max: maxIntensity,
          gradient,
          minOpacity: 0.4 // Add minimum opacity to ensure visibility
        });

        heatLayer.addTo(map);
        heatLayerRef.current = heatLayer;
        
        // Force a redraw of the map to ensure the heat layer is visible
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      } catch (error) {
        console.error('Error creating heat layer:', error);
      }
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points, radius, blur, maxIntensity, gradient, isVisible, heatPoints]);

  return null;
} 