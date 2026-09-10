// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
const environment = Deno.env.get("ENVIRONMENT") || "sandbox"
const client_id = Deno.env.get("PLAID_CLIENT_ID")!
const secret = Deno.env.get("PLAID_SECRET")!

Deno.serve(async (req) => {
  const { data: items, error } = await supabaseClient
    .from('plaid_items')
    .select('item_id, access_token')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  const results = []

  for (const item of items) {
    const response = await fetch(`https://${environment}.plaid.com/item/webhook/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id,
        secret,
        access_token: item.access_token,
        webhook: "https://svjigbewalmygfufmvie.supabase.co/functions/v1/plaid-webhook"
      })
    })

    const result = await response.json()
    results.push({ item_id: item.item_id, ok: response.ok, result })
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" }
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/set-webhooks' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
