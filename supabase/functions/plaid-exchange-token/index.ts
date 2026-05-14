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
  const body = await req.json()
  const user_id = body.user_id
  const public_token = body.public_token
  const institution_name = body.institution_name

  try {
    const response = await fetch("https://sandbox.plaid.com/item/public_token/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client_id,
        secret: secret,
        public_token: public_token
      })
    })


    const plaidExchangeData = await response.json()
    if (!response.ok) {
      throw new Error(`Plaid Error: ${plaidExchangeData.error_message || 'Exchange failed'}`)
    }
    const { data: insertedItem, error: itemError } = await supabaseClient
      .from('plaid_items')
      .upsert(
        {
          user_id: body.user_id,
          access_token: plaidExchangeData.access_token,
          item_id: plaidExchangeData.item_id,
          institution_name: body.institution_name
        },
        { onConflict: 'item_id' })
      .select()
      .single();

    if (itemError)  {
  console.error("Upsert error:", JSON.stringify(itemError));
  throw itemError;
}

if (!insertedItem) {
  console.error("insertedItem is null after upsert");
  throw new Error("Failed to upsert plaid_item");
}
    console.log("Successfully saved plaid_item:", insertedItem.id);

    const accountsResponse = await fetch("https://sandbox.plaid.com/accounts/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client_id,
        secret: secret,
        access_token: plaidExchangeData.access_token
      })
    })
    const plaidGetAcocunt = await accountsResponse.json()
    if (!accountsResponse.ok) {
      throw new Error(`Plaid Error: ${plaidGetAcocunt.error_message || 'Get Account failed'}`)
    }
    const accountToInsert = plaidGetAcocunt.accounts.map((acc: any) => ({
      user_id: user_id,
      account_id: acc.account_id,
      plaid_item_id: insertedItem.id,
      name: acc.name,
      balance: acc.balances.current ?? acc.balances.available ?? 0,
      type: acc.type,
      source: 'plaid'

    }))
    const { error: accountsError } = await supabaseClient
      .from('accounts')
      .upsert(accountToInsert, { onConflict: 'account_id' });
    if (accountsError) throw accountsError;

    return new Response(
      JSON.stringify({ success: true }),
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/plaid-exchange-token' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
