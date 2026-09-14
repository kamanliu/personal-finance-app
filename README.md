# 💰 TrackApp - Personal Finance Dashboard

A React Native app that connects to your bank accounts and gives you a real-time view of your net worth across all institutions. No manual entry, no outdated data.

## Demo

![App demo](./screenshots/demo.gif)

*Login → Home dashboard → Accounts → Stats/Budget → Link Bank (Plaid Sandbox)*

## Screenshots

<table>
  <tr>
    <td align="center"><b>Home</b></td>
    <td align="center"><b>Accounts</b></td>
    <td align="center"><b>Statistics</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/home.png" width="250"/></td>
    <td><img src="./screenshots/accounts.png" width="250"/></td>
    <td><img src="./screenshots/stats.png" width="250"/></td>
  </tr>
  <tr>
    <td align="center"><b>Budget</b></td>
    <td align="center"><b>Add Transaction</b></td>
    <td align="center"><b>Login</b></td>
  </tr>
  <tr>
    <td><img src="./screenshots/budget.png" width="250"/></td>
    <td><img src="./screenshots/add-transaction.png" width="250"/></td>
    <td><img src="./screenshots/login.png" width="250"/></td>
  </tr>
</table>

## What It Does

- **Link your banks** via Plaid (checking, savings, credit cards)
- **Auto-sync transactions** every minute in the background
- **See your net worth** instantly (Assets - Liabilities)
- **Track budgets** by category, with progress bars and over-limit warnings
- **Visualize spending** with pie charts broken down by category
- **Edit transactions** if something's wrong
- **Disconnect banks** anytime with automatic cleanup

## Tech Stack

- **Mobile:** React Native + Expo + Expo Router
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Banking:** Plaid API
- **Real-time:** Supabase Realtime (WebSockets)
- **Language:** TypeScript
- **State:** React Context API

## Setup

Getting this running end-to-end requires three things: the mobile app, a Supabase project, and a Plaid developer account. Here's the full path.

### 1. Clone and install

```bash
git clone https://github.com/kamanliu/personal-finance-app.git
cd personal-finance-app
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and grab your project URL + anon key from **Settings → API**.

Add them to a `.env` file at the project root:
```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set up the database

In the Supabase SQL editor, run:

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable real-time for these tables
ALTER PUBLICATION supabase_realtime 
ADD TABLE accounts, transactions, plaid_items, sync_queue;
```

Then create the app's tables — see the migration files in `supabase/migrations/` for the full schema.

### 4. Get Plaid API keys

Sign up for a free account at [dashboard.plaid.com](https://dashboard.plaid.com). Under **Team Settings → Keys**, copy your `client_id` and the **Sandbox** secret (Sandbox is free and uses fake bank data — no real bank account needed to test).

### 5. Set Supabase secrets

These are used by the Edge Functions (server-side), not the mobile app, so they're set via the Supabase CLI, not `.env`:

```bash
supabase secrets set \
  PLAID_CLIENT_ID=your_client_id \
  PLAID_SECRET=your_sandbox_secret \
  ENVIRONMENT=sandbox \
  CRON_SECRET=any_random_string_you_choose \
  SUPABASE_URL=your_url \
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

`ENVIRONMENT` controls which Plaid API (`sandbox.plaid.com` vs `production.plaid.com`) every function talks to. To switch later, update this plus the matching `PLAID_SECRET` for that environment, then redeploy (step 6).

### 6. Deploy the Edge Functions

```bash
supabase functions deploy plaid-link-token
supabase functions deploy create-update-link-token
supabase functions deploy plaid-exchange-token
supabase functions deploy sync-transactions
supabase functions deploy plaid-disconnect
supabase functions deploy plaid-webhook
supabase functions deploy process-sync-queue
supabase functions deploy set-webhooks
supabase functions deploy refresh-transactions
```

| Function | What it does |
|---|---|
| `plaid-link-token` | Generates link tokens for new bank connections |
| `create-update-link-token` | Generates update-mode tokens for reconnecting |
| `plaid-exchange-token` | Exchanges public tokens for access tokens |
| `sync-transactions` | Fetches and inserts transactions |
| `plaid-disconnect` | Removes a bank connection |
| `plaid-webhook` | Receives Plaid notifications |
| `process-sync-queue` | Background worker that processes sync jobs |
| `set-webhooks` | Registers/updates the webhook URL on existing items |
| `refresh-transactions` | Manually triggers a Plaid refresh |

### 7. Run the app

This app uses `react-native-plaid-link-sdk`, which includes native code and is **not compatible with Expo Go**. You'll need a development build instead.

**Option A — build locally:**
```bash
npx expo prebuild
npx expo run:ios      # or: npx expo run:android
```

**Option B — build via EAS (no local Xcode/Android Studio setup required):**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform ios
```
Install the resulting build on your device from the link EAS gives you, then start the dev server pointed at that build:
```bash
npx expo start --dev-client
```

## How It Actually Works

When you link a bank:
1. Plaid Link UI handles authentication securely
2. We exchange the public token for an access token
3. Fetch all your accounts and transactions
4. Tell Plaid to send us webhooks whenever something changes

When a transaction arrives:
1. Plaid webhook hits our function immediately
2. We add a job to `sync_queue` table
3. Every minute, the cron job picks up pending jobs
4. Fetches latest transactions from Plaid
5. Updates the database
6. Your app gets a real-time notification and refreshes instantly

If something crashes during sync, the job gets marked as failed (not stuck forever).

Plaid categories (like `FOOD_AND_DRINK`, `PERSONAL_CARE`) get normalized into the app's own category set on ingest, so manually-added and bank-synced transactions share the same categories, icons, and budgets.

## Current Features

- Link multiple banks at once ✔︎
- Real-time transaction syncing (every minute) ✔︎
- Auto-update UI when new data arrives ✔︎
- Edit/delete transactions ✔︎
- View net worth (Assets vs Liabilities) ✔︎
- Filter transactions by month, account, or category ✔︎
- Budget tracking with progress bars ✔︎
- Spending breakdown by category (pie charts) ✔︎
- Disconnect banks with cascade delete ✔︎
- Full error recovery (no zombie jobs) ✔︎
- Proper handling of credit cards as liabilities ✔︎

## What's Not Done Yet

- Bill reminders
- Multi-currency support
- Export data (CSV/PDF)

## Testing

Run `npx tsx scripts/test-webhook.ts` to simulate a Plaid webhook and manually trigger a sync for a linked bank, without waiting for a real bank event.

<details>
<summary><b>Troubleshooting</b></summary>

**Transactions not syncing?**
- Check the `sync_queue` table to see if jobs are failing
- Look at Edge Function logs: `supabase functions logs process-sync-queue`
- Make sure Realtime is enabled on the transactions table

**Button not showing "Syncing..."?**
- Make sure `sync_queue` is in your Realtime publications
- Check that the user_id is being passed correctly

**Balance looks wrong?**
- Credit cards should show as negative (they're debts)
- Make sure accounts are linked to the right transactions

**`INVALID_API_KEYS` from Plaid?**
- Your `PLAID_SECRET` doesn't match the environment in `ENVIRONMENT` (sandbox secret ≠ production secret) — re-check both in Supabase secrets

</details>

<details>
<summary><b>Key Design Decisions</b></summary>

**Queue-based syncing:** We don't call sync directly from the webhook. Instead, the webhook just adds a job to a queue. Every minute, a cron job picks up one job at a time, claims it (atomic update), syncs it, and marks it done. This prevents duplicate syncs and handles failures gracefully.

**Real-time listeners in context:** Instead of each screen fetching data separately, we listen for database changes in the `AccountContext` and call `refreshData()` automatically. This means all screens get updated at the same time without any manual refresh.

**Webhook validation:** Every webhook from Plaid includes a signature. We verify it matches our secret before processing anything.

**Category normalization:** Manual entries and Plaid-synced transactions can arrive with different category formats (`"Food"` vs `"FOOD_AND_DRINK"`). A normalization layer maps both into one shared category set, so budgets and icons stay consistent regardless of source.

</details>