# 💰 Personal Finance Dashboard

A production-grade React Native mobile application for real-time wealth tracking with bank-level security and automated transaction syncing.

## The Problem

Most budgeting apps require manual data entry, leading to outdated and incomplete financial snapshots. **TrackApp** solves this by connecting directly to users' bank accounts via Plaid, providing real-time net worth calculations across multiple institutions.

---

## ✨ Features

### Core Banking Integration
- **Plaid Bank Linking** - Securely connect checking, savings, and credit card accounts
- **Multi-Bank Support** - Link multiple banks simultaneously
- **Real-time Webhooks** - Instant notifications when transactions arrive at your bank
- **Smart Disconnect** - Remove banks with automatic cascade deletion of associated data

### Transaction Management
- **Automated Sync** - Background cron job processes transactions every 1 minute
- **Real-time Updates** - WebSocket listeners push changes to UI instantly (no manual refresh!)
- **Transaction Editing** - Modify transaction categories, notes, and amounts
- **Smart Categorization** - Plaid's personal finance categories for expense tracking
- **Pending Transaction Support** - See transactions before they fully clear

### Wealth Dashboard
- **Net Worth Calculation** - Real-time summary: Assets vs. Liabilities
- **Account Balancing** - Correct handling of credit card debt vs. asset accounts
- **Monthly Filtering** - View transactions by month
- **Multi-Account Stitch** - Unified view across all connected banks

### Advanced Architecture
- **Queue-Based Processing** - Atomic claims prevent duplicate syncing
- **Error Recovery** - Automatic cleanup if background jobs fail (no zombie transactions)
- **Rate Limiting** - Respects Plaid's API limits with smart cursor management
- **Production Logging** - Full error tracking for debugging

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native (Expo) |
| **Language** | TypeScript (type-safe financial data) |
| **Navigation** | Expo Router (file-based routing) |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **Banking** | Plaid API (bank connections + webhooks) |
| **Real-time** | Supabase Realtime (WebSocket subscriptions) |
| **State Management** | React Context API |
| **Background Jobs** | PostgreSQL pg_cron + HTTP triggers |
| **UI Components** | Lucide React, React Native |

---

## Architecture Overview

### System Design