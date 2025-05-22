
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Retrieve the API key from environment variables
    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    
    if (!apiKey) {
      throw new Error('Google Cloud API Key is not set');
    }
    
    return new Response(
      JSON.stringify({ 
        apiKey,
        message: 'API key retrieved successfully' 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error retrieving API key:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to retrieve API key' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
