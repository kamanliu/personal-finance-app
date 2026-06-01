// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

// allow broswer requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',

}

// getting Environment Variables 
const client_id = Deno.env.get("PLAID_CLIENT_ID")
const secret = Deno.env.get("PLAID_SECRET")


// start listening (happends for every request)
Deno.serve(async (req) => {

  // STEP 1: Check if OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    // STEP 2: Extract data from frontend
    const body = await req.json() // read body
    const user_id = body.user_id // get user_id

    // STEP 3: Call Plaid (YOUR server → Plaid server)
    const response = await fetch("https://sandbox.plaid.com/link/token/create", {
      method: "POST", // Plaid always wants POST for method
      headers: {
        "Content-Type": "application/json", // Telling Pliad wt kind of data is coming
      },

      // converted you request("order form") to a string
      body: JSON.stringify({
        client_id: client_id, // YOUR Pliad ID
        secret: secret, // YOUR Plaid secret
        client_name: "Track App",
        products: ['transactions'],
        country_codes: ['CA', 'US'],
        language: 'en',
        user: { client_user_id: user_id }, // User from frontend, Plaid needs a unique ID for the user
        webhook: "https://svjigbewalmygfufmvie.supabase.co/functions/v1/plaid-webhook"
        
      })
    })

    // STEP 4: Read Plaid's response
    const plaidData = await response.json() // Parse Plaid response
    return new Response(
      // this turn your organized code into a single long string 
      // of text tha can travel over the internet
      JSON.stringify(plaidData), // The link_token

      // this tells Plaid, im sending a JSON
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
  catch (error) {
    const status = error.status || 500;  // 400 - bad request, wrong info sent or 500 - server broke 
    return new Response(
      JSON.stringify({ error: error.message }),

      {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/plaid-link-token' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
