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
      .select('id, access_token, next_cursor, item_id')
      .eq('user_id', user_id)

    if (itemError) {
      console.error(itemError.message)
      return new Response(
        JSON.stringify({ error: itemError.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
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
      )
    }

    let totalTransactionsInserted = 0;
    const syncedItemIds: string[] = [];
    const failedItemIds: string[] = [];

    //Loop through every bank link linked to the user dynamically
    for (const itemData of itemDataList) {
      try {
        let currentCursor = itemData.next_cursor
        let hasMore = true

        // Accumulator arrays to bulk sync across paginated states
        let allAddedAndModified: any[] = []
        let allRemovedIds: string[] = []
        let accountsToUpsert: any[] = []

        while (hasMore) {
          const response = await fetch("https://production.plaid.com/transactions/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: client_id,
              secret: secret,
              access_token: itemData.access_token,
              cursor: currentCursor
            })
          })

          if (!response.ok) {
            const errText = await response.json()
            if (errText.error_code === 'TRANSACTIONS_SYNC_MUTATION_DURING_PAGINATION') {
              // If yes, reset the cursor to null
              await supabaseClient.from('plaid_items')
                .update({ next_cursor: null })
                .eq('item_id', itemData.item_id)

              console.warn(`Cursor reset forced for item ${itemData.item_id}. Retrying on next pass.`);
              hasMore = false
              break // Exit the pagination loop, but not the item loop
            }
            if (errText.error_code === 'ITEM_LOGIN_REQUIRED') {
              console.warn(`⚠️ Item ${itemData.item_id} requires re-authentication`)
              await supabaseClient
                .from('plaid_items')
                .update({ status: 'login_required' })
                .eq('item_id', itemData.item_id)

              hasMore = false
              break
            }
            throw new Error(`Plaid API structural error: ${JSON.stringify(errText)}`)
          }

          const plaidData = await response.json()
          let { added, modified, removed, next_cursor, has_more, accounts: plaidAccounts } = plaidData

          // ✅ ADD THIS DEBUG LOG
          console.log('🔍 Plaid raw response accounts:', JSON.stringify(plaidAccounts, null, 2))
          console.log('🔍 Plaid raw response transactions:', JSON.stringify(added?.slice(0, 1), null, 2))
          // Accumulate changes across pagination before hitting the database
          if (added) allAddedAndModified.push(...added)
          if (modified) allAddedAndModified.push(...modified)
          if (removed) allRemovedIds.push(...removed.map((t: any) => t.transaction_id))

          if (!plaidAccounts || plaidAccounts.length == 0) {
            const accountResponse = await fetch("https://production.plaid.com/accounts/balance/get", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                client_id: client_id,
                secret: secret,
                access_token: itemData.access_token
              })
            })
            if (accountResponse.ok) {
              const plaidGetAcocunt = await accountResponse.json()
              plaidAccounts = plaidGetAcocunt.accounts

            }
          }

          if (plaidAccounts && plaidAccounts.length > 0) {
            const newAccounts = plaidAccounts.map((acc: any) => ({
              user_id: user_id,
              account_id: acc.account_id,
              plaid_item_id: itemData.id,
              name: acc.name,
              balance: Number((acc.balances.current ?? 0).toFixed(2)),
              type: acc.type,
              source: 'plaid'

            }))
            accountsToUpsert.push(...newAccounts)
          }
          currentCursor = next_cursor
          hasMore = has_more
        }


        // NEW: Debug log
        if (allAddedAndModified.length > 0) {
          console.log('💳 Transaction account_ids being used:', allAddedAndModified.map(t => t.account_id))
        }

        // 1. Flush Account balances
        const uniqueAccounts = Array.from(
          new Map(accountsToUpsert.map(a => [a.account_id, a])).values()
        )

        if (uniqueAccounts.length > 0) {
          console.log('📊 Accounts being upserted:', uniqueAccounts.map(a => a.account_id))
          const { error: accError } = await supabaseClient
            .from('accounts')
            .upsert(uniqueAccounts, { onConflict: 'account_id' })
          if (accError) throw accError
        }
        // update the transactionsToInsert mapping block
        if (allAddedAndModified.length > 0) {
          const transactionsToInsert = allAddedAndModified.map((plaidTx) => {
            // Find the matching UUID using Plaid's account_id
            const transactionType = plaidTx.amount < 0 ? 'Income' : 'Expense';
            return {
              user_id: user_id,
              account_id: plaidTx.account_id,
              note: plaidTx.merchant_name ?? plaidTx.name ?? 'Unknown Transaction',
              // 2. Turn the amount into a clean, absolute positive number for the database
              amount: Math.abs(plaidTx.amount),
              date: plaidTx.date,
              category: plaidTx.personal_finance_category?.primary ?? 'General',
              pending: plaidTx.pending,
              plaid_transaction_id: plaidTx.transaction_id,
              source: 'plaid',
              type: transactionType
            }
          })
          const { error: txUpsertError } = await supabaseClient
            .from('transactions')
            .upsert(transactionsToInsert, { onConflict: 'plaid_transaction_id' })

          if (txUpsertError) throw txUpsertError
          totalTransactionsInserted += transactionsToInsert.length
        }
        // 3. Process hard purging instructions
        if (allRemovedIds.length > 0) {
          const { error: deleteError } = await supabaseClient
            .from('transactions')
            .delete()
            .in('plaid_transaction_id', allRemovedIds)
          if (deleteError) throw deleteError
        }

        // 4. Save tracking cursor state permanently
        const { error: cursorError } = await supabaseClient
          .from('plaid_items')
          .update({ next_cursor: currentCursor })
          .eq('item_id', itemData.item_id)
        if (cursorError) throw cursorError

        syncedItemIds.push(itemData.item_id)

      } catch (itemError: any) {
        console.error(`Error processing item ${itemData.item_id}:`, itemError.message)
        failedItemIds.push(itemData.item_id)
      }
    }
    return new Response(
      JSON.stringify({
        success: failedItemIds.length === 0,
        message: `Processed ${syncedItemIds.length} link systems successfully. ${failedItemIds.length} items failed parsing.`,
        transactions_processed: totalTransactionsInserted,
        failed_connections: failedItemIds
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    )

  } catch (err: any) {
    console.error("Critical Unhandled Function Level Failure:", err.message)
    return new Response(
      JSON.stringify({ error: err.message || 'An unknown structural component error occurred' }),
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