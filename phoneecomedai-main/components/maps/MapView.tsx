"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Map as MapIcon, Navigation, Locate, Loader2, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { healthDataSets, HealthHeatPoint } from "./data/healthData";
import HealthDataStats from "./HealthDataStats";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { motion, AnimatePresence } from 'framer-motion';
import type { Map as LeafletMap } from 'leaflet';
import type { MapContainerProps } from 'react-leaflet';

// Dynamically import the map component with no SSR
const Map = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const MarkerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const PopupComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Interface moved outside the components
interface MapLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "hospital" | "clinic" | "pharmacy";
}

// Sample locations - in a real app, these would come from an API
const sampleLocations: MapLocation[] = [
  { 
    id: "1", 
    name: "All India Institute of Medical Sciences (AIIMS)", 
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi", 
    lat: 28.5672, 
    lng: 77.2100, 
    type: "hospital" 
  },
  { 
    id: "2", 
    name: "Apollo Hospitals", 
    address: "Sarita Vihar, Delhi Mathura Road, New Delhi", 
    lat: 28.5298, 
    lng: 77.2905, 
    type: "hospital" 
  },
  { 
    id: "3", 
    name: "Fortis Hospital", 
    address: "Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj", 
    lat: 28.5179, 
    lng: 77.1613, 
    type: "hospital" 
  },
  { 
    id: "4", 
    name: "Max Super Speciality Hospital", 
    address: "1, 2, Press Enclave Road, Saket", 
    lat: 28.5278, 
    lng: 77.2148, 
    type: "hospital" 
  },
  { 
    id: "5", 
    name: "Moolchand Medcity", 
    address: "Lala Lajpat Rai Marg, Near Defence Colony", 
    lat: 28.5685, 
    lng: 77.2380, 
    type: "clinic" 
  },
  { 
    id: "6", 
    name: "Delhi Pharmacy", 
    address: "Connaught Place, New Delhi", 
    lat: 28.6315, 
    lng: 77.2197, 
    type: "pharmacy" 
  },
];

// Dynamic import of the MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("./MapComponent"), {
  loading: () => <Skeleton className="w-full h-[500px]" />,
  ssr: false
});

type HealthDataType = 'covid' | 'flu' | 'healthcare_access';

interface MapViewProps {
  showHeatmap?: boolean;
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    type: string;
  }>;
  heatmapData?: Array<[number, number, number]>;
  onMarkerClick?: (id: string) => void;
}

interface MapReadyEvent {
  target: LeafletMap;
}

// Custom marker icons
const createMarkerIcon = (type: string) => {
  const color = type === 'hospital' ? '#ef4444' : 
                type === 'clinic' ? '#8b5cf6' : 
                '#22c55e';
  
  return L.divIcon({
    html: `
      <div class="w-8 h-8 -ml-4 -mt-4 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
        <div class="w-6 h-6 rounded-full" style="background-color: ${color}"></div>
      </div>
    `,
    className: '',
  });
};

export function MapView({
  showHeatmap = false,
  center = [28.6139, 77.2090], // New Delhi coordinates
  zoom = 12,
  markers = [],
  heatmapData = [],
  onMarkerClick
}: MapViewProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const heatmapLayerRef = useRef<L.Layer | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Initialize heat map layer when the map is ready
    if (isMapReady && showHeatmap && heatmapData.length > 0 && mapRef.current) {
      if (!heatmapLayerRef.current) {
        // @ts-ignore - leaflet.heat types are not available
        heatmapLayerRef.current = L.heatLayer(heatmapData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          gradient: {
            0.4: '#22c55e',
            0.6: '#eab308',
            0.8: '#ef4444'
          }
        }).addTo(mapRef.current);
      }
    } else if (heatmapLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(heatmapLayerRef.current);
      heatmapLayerRef.current = null;
    }
  }, [isMapReady, showHeatmap, heatmapData]);

  const handleMapReady = (e: MapReadyEvent) => {
    mapRef.current = e.target;
    setIsMapReady(true);
  };

  return (
    <div className="relative w-full h-full">
      <Map
        center={center}
        zoom={zoom}
        className="w-full h-full z-0"
        whenReady={handleMapReady as any} // Type assertion needed due to react-leaflet types
      >
        <TileLayerComponent
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <AnimatePresence>
          {markers.map((marker) => (
            <motion.div
              key={marker.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MarkerComponent
                position={marker.position}
                icon={createMarkerIcon(marker.type)}
                eventHandlers={{
                  click: () => onMarkerClick?.(marker.id)
                }}
              >
                <PopupComponent>
                  <div className="p-2">
                    <h3 className="font-medium">{marker.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {marker.type}
                    </p>
                  </div>
                </PopupComponent>
              </MarkerComponent>
            </motion.div>
          ))}
        </AnimatePresence>
      </Map>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border"
          onClick={() => mapRef.current?.zoomIn()}
        >
          +
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border"
          onClick={() => mapRef.current?.zoomOut()}
        >
          -
        </motion.button>
      </div>

      {/* Loading Indicator */}
      <AnimatePresence>
        {!isMapReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 