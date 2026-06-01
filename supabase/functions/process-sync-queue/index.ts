// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get("SUPABASE_URL")
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)


Deno.serve(async (req) => {
  // 1. SECURE THE ENDPOINT WITH A SIMPLE CUSTOM KEY
  const url = new URL(req.url);
  const secretParam = url.searchParams.get("secret");
  
  // Choose any secure phrase you want here
  const MY_CRON_SECRET = "super_secure_cron_heartbeat_2026"; 
  // Compares: "Does the secret in the URL match MY_CRON_SECRET?
  if (secretParam !== MY_CRON_SECRET) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }), 
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  let claimedJob = null;
  try {
    const { data: job, error: claimError } = await supabaseClient
      .from('sync_queue')
      .update({ status: 'processing' })
      .eq('status', 'pending') // only update if status is 'pending'
      .select('id, item_id')// return to the updated row
      .limit(1)
      .maybeSingle() // returns null safely instead of throwing a massive error if the queue is empty


    if (claimError) throw claimError;
    if (!job) {
      return new Response(JSON.stringify({ message: 'No jobs' }), { status: 200 })
    }
    claimedJob = job;

    const { data: plaidItemData, error: lookUpError } = await supabaseClient
      .from('plaid_items')
      .select('user_id')
      .eq('item_id', claimedJob.item_id)
      .single()


    if (lookUpError) {
      throw new Error(`Failed to find user: ${lookUpError.message}`)
    }


    const { data, error } = await supabaseClient.functions.invoke('sync-transactions', {
      body: { user_id: plaidItemData.user_id }
    })
    if (error) {
      await supabaseClient
        .from('sync_queue')
        .update({ status: 'failed', last_error: error.message })
        .eq('id', claimedJob.id) // mark this job as failed
      throw new Error(`Internal sync function failed: ${error.message}`)
    }
    // otherwise
    await supabaseClient
      .from('sync_queue')
      .update({ status: 'completed' }) // mark job as done
      .eq('id', claimedJob.id)

    return new Response(
      JSON.stringify({ success: true, message: 'Job processed' }),
      { headers: { "Content-Type": "application/json" } },
    )

  } catch (error) {
    console.error('Queue processor error:', error)

    // IF WE CLAIMED A JOB BUT THEN CRASHED
    if (claimedJob?.id) {
      await supabaseClient
        .from('sync_queue')
        .update({
          status: 'failed',
          last_error: `Worker crashed: ${error.message}`
        })
        .eq('id', claimedJob.id) // UNLOCK IT
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }



})


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-sync-queue' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
