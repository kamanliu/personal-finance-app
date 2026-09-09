// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// To verify JWT signatures
import { decode, verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts"



const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

const client_id = Deno.env.get("PLAID_CLIENT_ID")!
const secret = Deno.env.get("PLAID_SECRET")

Deno.serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    const rawBody = await req.text()

    const signatureHeader = req.headers.get("Plaid-Verification-Signature")
    const isSandbox = Deno.env.get("ENVIRONMENT") === "sandbox"

    if (!signatureHeader && !isSandbox) {
      console.error("❌ Rejected: Missing Plaid-Verification-Signature header.")
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401 })
    }

    if (signatureHeader) {
      console.log("🔒 Verifying Plaid Signature...")


      // Decode the JWT to get the key ID (kid) and fetch the corresponding public key from Plaid
      // _ means ignore
      const [header, _payload, _signature] = decode(signatureHeader)
      const keyId = header?.kid

      if (!keyId) throw new Error("Invalid JWT header formatting: missing key ID (kid)")

      const response = await fetch("https://production.plaid.com/webhook/verification_key/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client_id,
          secret: secret,
          key_id: keyId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed fetching validation parameters from Plaid: ${response.statusText}`)
      }

      const { key } = await response.json()


      const cryptoKey = await crypto.subtle.importKey(
        "jwk",
        key,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        true,
        ["verify"]
      )

      await verify(signatureHeader, cryptoKey)
      console.log("✅ Signature verified! This payload genuinely came from Plaid.")
    }
    const payload = JSON.parse(rawBody)
    console.log('Plaid Webhook received:', payload)

    const itemId = payload.item_id

    if (payload.webhook_type === 'ITEM' && payload.webhook_code === 'ERROR' &&
      payload.error?.error_code === 'ITEM_LOGIN_REQUIRED') {

      console.warn(`⚠️ Item ${itemId} requires re-authentication`)

      const { error: statusError } = await supabaseClient
        .from('plaid_items')
        .update({ status: 'login_required' })
        .eq('item_id', itemId)

      if (statusError) {
        console.error('Failed to update item status:', statusError.message)
      }

      return new Response(
        JSON.stringify({ acknowledged: true, flagged: 'login_required' }),
        { headers: { "Content-Type": "application/json" } }
      )
    }
    if (!itemId) {
      return new Response(
        JSON.stringify({ error: "No item_id in webhook" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Add to sync_queue
    const { error } = await supabaseClient
      .from('sync_queue')
      .insert({
        item_id: itemId,
        status: 'pending',
        attempts: 0
      })

    if (error) throw error

    console.log(`✅ Queued sync for item: ${itemId}`)

    return new Response(
      JSON.stringify({ acknowledged: true }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return new Response(
      JSON.stringify({ error: "Unauthorized payload source" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/plaid-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
