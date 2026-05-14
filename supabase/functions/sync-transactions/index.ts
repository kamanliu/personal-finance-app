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

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id in the payload" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      )
    }

    // Retrieve records without .single() to prevent array coercion errors
    const { data: itemDataList, error: itemError } = await supabaseClient
      .from('plaid_items')
      .select('access_token, next_cursor, item_id') // Add item_id here
      .eq('user_id', user_id)
    if (itemError) {
      console.error(itemError.message)
      return new Response(
        JSON.stringify({ error: itemError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      )
    }

    // Check if the list exists and has items
    if (!itemDataList || itemDataList.length === 0) {
      console.error("No plaid_items found for user:", user_id);
      return new Response(
        JSON.stringify({ error: "No linked bank account found for this user." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        }
      );
    }

    // Extract the first item without redeclaring a `const` block for `itemData`
    const itemData = itemDataList[0];

    const response = await fetch("https://sandbox.plaid.com/transactions/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: client_id,
        secret: secret,
        access_token: itemData.access_token,
        cursor: itemData.next_cursor
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Plaid API call failed: ${errText}`)
    }

    const plaidData = await response.json()

    const { added, modified, removed, next_cursor } = plaidData
    const allChanges = [...(added || []), ...(modified || [])]

    console.log('Plaid data:', { added: added?.length, modified: modified?.length, removed: removed?.length })
    console.log('Total transactions to insert:', allChanges.length)

    const { data: localAccounts } = await supabaseClient
      .from('accounts')
      .select('id,account_id') // id - UUID, account_id - plaid'string
      .eq('user_id', user_id)

    // a quick lookup map
    const accountMap = new Map(localAccounts?.map(a => [a.account_id, a.id] || []));

    // update the transactionsToInsert mapping block
    const transactionsToInsert = allChanges.map((plaidTx) => {

      // Find the matching UUID using Plaid's account_id
      const localAccountUuid = accountMap.get(plaidTx.account_id) || plaidTx.account_id;
      return {
        user_id: user_id,
        account_id: plaidTx.account_id,
        note: plaidTx.merchant_name ?? plaidTx.name ?? 'Unknown Transaction', // Added extra fallback
        amount: plaidTx.amount,
        date: plaidTx.date,
        category: plaidTx.personal_finance_category?.primary ?? 'General',
        pending: plaidTx.pending,
        plaid_transaction_id: plaidTx.transaction_id,
        source: 'plaid',
        type: plaidTx.amount > 0 ? 'expense' : 'income'
      }
    })

    if (transactionsToInsert.length > 0) {
      const { error: upsertError } = await supabaseClient.from('transactions')
        .upsert(transactionsToInsert, { onConflict: 'plaid_transaction_id' })

      if (upsertError) {
        console.error('Upsert error:', upsertError)
        throw upsertError
      }
    }

    if (removed && removed.length > 0) {
      await supabaseClient.from('transactions')
        .delete()
        .in('plaid_transaction_id', removed.map(t => t.transaction_id))
    }

    await supabaseClient.from('plaid_items')
      .update({ next_cursor: next_cursor })
      .eq('item_id', itemData.item_id) // Targets the specific connection being synced

    return new Response(
      JSON.stringify({ success: true, new_cursor: next_cursor }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )

  } catch (err: any) {
    console.error("Critical Function Error:", err.message)
    return new Response(
      JSON.stringify({ error: err.message || 'An unknown server error occurred' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sync-transactions' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"user_id":"d523b403-871f-4ee5-8336-86f9ac4a8766"}'

*/