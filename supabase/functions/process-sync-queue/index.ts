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
  // 🔐 Door 2 Security: Check X-Cron-Secret header
  const cronSecret = req.headers.get("X-Cron-Secret")
  const expectedSecret = Deno.env.get("CRON_SECRET")

  if (cronSecret !== expectedSecret) {
    console.error('❌ Unauthorized cron access attempt')
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  console.log('✅ Cron handshake verified')

  const { data: alreadyProcessing, error: processingError } = await supabaseClient
    .from('sync_queue')
    .select('id')
    .eq('status', 'processing')
    .limit(1)
    .maybeSingle()

  if (processingError) {
    console.error('❌ Failed to check processing jobs:', processingError.message)
    return new Response(
      JSON.stringify({ error: processingError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
  if (alreadyProcessing) {
    console.log('⏳ A job is already being processed. Exiting.')
    return new Response(
      JSON.stringify({ message: 'A job is already being processed. Exiting.' }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  let claimedJob = null
  try {
    // find the oldest pending job (do not touch it yet)
    const { data: pendingJob, error: findError } = await supabaseClient
      .from('sync_queue')
      .select('id, item_id')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (findError) throw findError
    if (!pendingJob) {
      return new Response(
        JSON.stringify({ message: 'No jobs in queue' }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }

    // claim Only that specific row by its id
    const { data: job, error: claimError } = await supabaseClient
      .from('sync_queue')
      .update({ status: 'processing' })
      .eq('id', pendingJob.id)
      .eq('status', 'pending') // ensure it's still pending
      .select()
      .maybeSingle()

    if (claimError) throw claimError
    if (!job) {
      return new Response(
        JSON.stringify({ message: 'No jobs in queue' }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    }
    claimedJob = job
    console.log(`📍 Processing job ${job.id} for item ${job.item_id}`)

    // Look up the user for this plaid item
    const { data: plaidItemData, error: lookUpError } = await supabaseClient
      .from('plaid_items')
      .select('user_id')
      .eq('item_id', claimedJob.item_id)
      .maybeSingle()

    if (lookUpError) {
      throw new Error(`Failed to find user: ${lookUpError.message}`)
    }
    if (!plaidItemData) {
      throw new Error(`No plaid_items row found for item_id: ${claimedJob.item_id}`)
    }

    // Call sync-transactions for this user
    const { data, error } = await supabaseClient.functions.invoke('sync-transactions', {
      body: { user_id: plaidItemData.user_id }
    })

    // 🛠️ FIX 1: Return early on error (don't fall through to catch block)
    if (error) {
      console.error(`🔴 Sync failed for job ${claimedJob.id}:`, error.message)
      await supabaseClient
        .from('sync_queue')
        .update({
          status: 'failed',
          error: `Sync function failed: ${error.message}`,  // ✅ Correct column name
          attempts: 1
        })
        .eq('id', claimedJob.id)

      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      )
    }

    // Success! Mark as completed
    await supabaseClient
      .from('sync_queue')
      .update({ status: 'completed' })
      .eq('id', claimedJob.id)

    console.log(`✅ Job ${claimedJob.id} completed`)

    return new Response(
      JSON.stringify({ success: true, message: 'Job processed' }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error: any) {
    console.error('Queue processor error:', error.message)

    // 🛠️ FIX 2: Only catches unhandled crashes
    if (claimedJob?.id) {
      await supabaseClient
        .from('sync_queue')
        .update({
          status: 'failed',
          error: `Worker crashed: ${error.message}`,  // ✅ Correct column name
          attempts: 1
        })
        .eq('id', claimedJob.id)
    }

    // 🛠️ FIX 3: Complete response
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
