# 💰 Personal Finance Dashboard
**A React Native mobile application for real-time wealth tracking.**

### **The Problem**
Most budgeting apps require manual data entry, which is tedious and leads to outdated info. I wanted to build a dashboard that connects directly to bank accounts to give a "one-glance" view of total net worth across different institutions.

### **Tech Stack**
* **Mobile:** React Native (Expo)
* **Language:** TypeScript (for type safety with financial data)
* **Navigation:** Expo Router (File-based routing)
* **Banking Data:** Plaid API (Link SDK)
* **Icons/UI:** Lucide-React / Vector Icons

### **Current Features**
* **Modular UI:** Reusable components for transaction lists and account balances.
* **Navigation Flow:** Separate views for Overview, Transactions, and Settings using Expo Router.
* **Bank Connection (In Progress):** Integrating the Plaid Link flow to securely authenticate users' bank accounts.

---

### **How to Run it Locally**

1. **Clone the repo:**
   ```bash
   git clone [https://github.com/kamanliu/personal-finance-app.git](https://github.com/kamanliu/personal-finance-app.git)

2. **Install dependencies:** 
     ```bash
     npm install

2. **Start the app:** 
     ```bash
     npx expo start

Download the Expo Go app on your phone to scan the QR code and see it in action.


Upcoming Milestones

[ ] Finalizing the Plaid access_token exchange logic.

[ ] Adding automated transaction categorization (e.g., Grocery vs. Rent).

[ ] Creating a "Net Worth" chart using React Native Gifted Charts.