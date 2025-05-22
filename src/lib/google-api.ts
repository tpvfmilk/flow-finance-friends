
import { supabase } from "@/integrations/supabase/client";

interface GoogleApiConfig {
  apiKey: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Retrieves the Google Cloud API key from Supabase
 */
export const getGoogleApiKey = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-google-api-key');
    
    if (error) {
      console.error('Error fetching Google API key:', error);
      return null;
    }
    
    return data?.apiKey || null;
  } catch (err) {
    console.error('Failed to fetch Google API key:', err);
    return null;
  }
};

/**
 * Loads the Google Maps JavaScript API
 */
export const loadGoogleMapsApi = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if API is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
};
