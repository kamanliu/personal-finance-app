import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config(); // Loads your keys locally if you use a .env file

// console.log('🔍 Debug: Checking env vars...');
// console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
// console.log('ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
// console.log('');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
const SUPABASE_FUNC_URL = `${SUPABASE_URL}/functions/v1/plaid-webhook`;


const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Returns a list of text strings (item IDs) from the plaid_items table, which represent linked bank accounts
async function getAvailableItemIds(): Promise<string[]> {
    try {
        console.log('📡 Fetching available item IDs from plaid_items table...\n');

        const { data, error } = await supabase
            .from('plaid_items')
            .select('item_id')
            .limit(10);
        console.log(data)

        // If something goes wrong with the query, log the error and return an empty list
        if (error) {
            console.error('❌ Failed to fetch item IDs:', error.message);
            return [];
        }

        // If no banks are linked, log a warning and return an empty list
        if (!data || data.length === 0) {
            console.warn('⚠️  No linked bank accounts found. Link a bank account first!');
            return [];
        }

        // Extract just the item_i strings from the query result and return them as a list
        return data.map((item: any) => item.item_id);
    } catch (error) {
        console.error('💥 Error querying database:', error);
        return [];
    }
}

// Ask the user a question and waits for their answer, returning it as a string
async function promptUser(question: string): Promise<string> {

    // A "listener" that waits for user input in the terminal and resolves the promise with the answer
    const rl = readline.createInterface({
        input: process.stdin, // Standard input (keyboard)
        output: process.stdout, // Display on scrren
    });

    return new Promise((resolve) => {

         // Display the question and wait for the answer
         // (answer) => { ... } = When user types answer, do this
        rl.question(question, (answer) => {
            rl.close(); // Close the listener
            resolve(answer.trim()); // Return the user's answer, removing any extra whitespace just in case
        });
    });
}

// Send a fake webhook to Edge Function, takes one input: itemId
async function fireMockWebhook(itemId: string) {

    // Create the fake data to send. Looks like a real Plaid webhook
    const mockPayload = {
        webhook_type: 'TRANSACTIONS',
        webhook_code: 'SYNC_UPDATES_AVAILABLE',
        item_id: itemId
    };

    console.log('\n🚀 Firing mock Plaid transaction webhook...');
    console.log('📦 Payload:', JSON.stringify(mockPayload, null, 2));

    try {
        // fectch() = Match HTTP request to the Edge Function URL, and send the mockPayload as the body of the request
        const response = await fetch(SUPABASE_FUNC_URL, {
            method: 'POST', // Send data (not just get)
            headers: { // Include authentication
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(mockPayload) // Convert the JavaScript object into a JSON string to send over the network
        });

        const status = response.status;
        const data = await response.json();

        // Get the response code (200 = success, 400+ = error)
        if (response.ok) {
            console.log(`\n✅ Success! Status: ${status}`);
            console.log('Result:', data);
            console.log('\n💡 Check your sync_queue table:');
            console.log('   SELECT * FROM sync_queue ORDER BY created_at DESC LIMIT 5;\n');
        } else {
            console.error(`\n❌ Failed! Status: ${status}`);
            console.error('Error Details:', data);
        }
    } catch (error) {
        console.error('\n💥 Network error:', error);
    }
}
// Main entry point to run the script
async function main() {
    console.log('\n╔════════════════════════════════════╗');
    console.log('║  FinTrack Webhook Tester           ║');
    console.log('╚════════════════════════════════════╝\n');

    // Call the function to get item IDs from the database, and store them in a variable called itemIds
    let itemIds = await getAvailableItemIds();


    // If no banks found, tell user and exit the script (don't try to send a webhook with an empty item_id)
    if (itemIds.length === 0) {
        console.log('⚠️  No item IDs available.');
        console.log('💡 Link a bank account in your app first, then try again.\n');
        process.exit(0);
    }
    

    console.log('📌 Available bank connections:\n');
    itemIds.forEach((id, index) => {
        console.log(`${index + 1}. ${id}`);
    });

    // Ask the user to select one of the item IDs from the list, or paste a custom one if they want
    const choice = await promptUser('\nEnter the number of your choice (or paste a custom item_id): ');

    // Declare a variable to hold the final selected item ID that we will send in the webhook
    let selectedItemId: string;

    // Use regex so strings like "2abc" don't accidentally match menu number 2
    if (/^\d+$/.test(choice)) {
        const index = parseInt(choice, 10) - 1;
        if (index < 0 || index >= itemIds.length) {
            console.error('❌ Invalid menu selection.');
            process.exit(1);
        }
        selectedItemId = itemIds[index];
    } else {
        //  If not a pure number, treat it as a custom item_id (user pasted it)
        selectedItemId = choice;
    }

    console.log(`\n✓ Selected item_id: ${selectedItemId}`);
    await fireMockWebhook(selectedItemId);
}

main();