
import { useRef, useEffect, useState } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
  }>;
  height?: string;
}

export function GoogleMap({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to New York
  zoom = 12,
  markers = [],
  height = "400px"
}: GoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();
  
  // Initialize the map when the API is loaded
  useEffect(() => {
    if (isLoaded && mapContainerRef.current && !map) {
      const newMap = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });
      
      setMap(newMap);
    }
  }, [isLoaded, mapContainerRef, map, center, zoom]);
  
  // Add markers when map is ready
  useEffect(() => {
    if (map && markers.length > 0) {
      // Clear existing markers first
      markers.forEach(markerData => {
        new google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title
        });
      });
    }
  }, [map, markers]);
  
  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Map Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load Google Maps: {loadError.message}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-gray-100 animate-pulse rounded-md">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div 
      ref={mapContainerRef} 
      style={{ height, width: "100%" }}
      className="rounded-md overflow-hidden"
    />
  );
}
