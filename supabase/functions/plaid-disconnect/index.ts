// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const client_id = Deno.env.get("PLAID_CLIENT_ID")
const secret = Deno.env.get("PLAID_SECRET")
const supabaseUrl = Deno.env.get("SUPABASE_URL")
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const body = await req.json()
    const user_id = body.user_id
    const item_id = body.item_id

    if (!user_id || !item_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or item_id" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      )
    }
    const { data, error } = await supabaseClient
      .from('plaid_items')
      .select('access_token')
      .eq('item_id', item_id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: "Connection not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        )
      }
      throw error;
    }

    const accessToken = data.access_token
    const response = await fetch("https://sandbox.plaid.com/item/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client_id,
        secret: secret,
        access_token: accessToken
      })
    })
    if (!response.ok) {
      const plaidError = await response.json()
      throw new Error(`Plaid Error: ${plaidError.error_message || 'Failed to remove item'}`)
    }

    const { error: deleteError } = await supabaseClient
      .from('plaid_items')
      .delete()
      .eq('item_id', item_id)

    if (deleteError) {
      throw deleteError
    }
    return new Response(
      JSON.stringify({ success: true, message: "Bank account disconnected" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/plaid-disconnect' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
