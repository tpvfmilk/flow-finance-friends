
import { useState, useEffect } from "react";
import { getGoogleApiKey, loadGoogleMapsApi } from "@/lib/google-api";

interface UseGoogleMapsOptions {
  autoLoad?: boolean;
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | null;
  loadApi: () => Promise<void>;
}

export function useGoogleMaps(options: UseGoogleMapsOptions = {}): UseGoogleMapsReturn {
  const { autoLoad = true } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const loadApi = async () => {
    try {
      const apiKey = await getGoogleApiKey();
      
      if (!apiKey) {
        throw new Error("Google API key not found");
      }
      
      await loadGoogleMapsApi(apiKey);
      setIsLoaded(true);
    } catch (error) {
      console.error("Error loading Google Maps API:", error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadApi();
    }
  }, [autoLoad]);

  return { isLoaded, loadError, loadApi };
}
