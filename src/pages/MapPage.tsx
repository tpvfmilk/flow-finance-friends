
import { useState } from "react";
import { GoogleMap } from "@/components/maps/GoogleMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MapPage() {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default to San Francisco
  const [markers, setMarkers] = useState<Array<{position: {lat: number; lng: number}, title?: string}>>([
    { position: { lat: 37.7749, lng: -122.4194 }, title: "San Francisco" }
  ]);
  const [newLocation, setNewLocation] = useState("");
  const [zoom, setZoom] = useState(10);
  
  const addRandomMarker = () => {
    // Add a marker slightly offset from the center
    const offset = Math.random() * 0.05;
    const newMarker = {
      position: {
        lat: center.lat + (Math.random() > 0.5 ? offset : -offset),
        lng: center.lng + (Math.random() > 0.5 ? offset : -offset)
      },
      title: `Location ${markers.length + 1}`
    };
    
    setMarkers([...markers, newMarker]);
  };
  
  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 20));
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 1));
  
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Map View</h1>
        <p className="text-muted-foreground">
          Visualize your financial activity by location.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>View and interact with your financial locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <GoogleMap 
                  center={center}
                  markers={markers}
                  zoom={zoom}
                  height="100%"
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button onClick={handleZoomIn} size="sm">Zoom In</Button>
                <Button onClick={handleZoomOut} size="sm">Zoom Out</Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">New location</Label>
                <Input 
                  id="location" 
                  placeholder="Search location..." 
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>
              
              <Button onClick={addRandomMarker} className="w-full">
                Add Random Marker
              </Button>
              
              <div className="space-y-2">
                <h3 className="font-medium">Markers ({markers.length})</h3>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {markers.map((marker, index) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded-md">
                      {marker.title || `Location ${index + 1}`}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
