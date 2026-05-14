import { Database } from '@/database.types';
import { supabase } from '@/lib/supabase';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

/* Set up a 'system' for the app, by moving the state to a central file,
this allow any page to 'read' or 'write' to the account list simultaneosly */

export type Account = Database['public']['Tables']['accounts']['Row'] & { transactions: Transaction[] }
export type Transaction = Database['public']['Tables']['transactions']['Row']

export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

export type UpdateTransaction = Database['public']['Tables']['transactions']['Update']


// defines the shape of a single account object
// export type Account = {
//     id: string;
//     user_id: string;
//     type: string;
//     name: string;
//     balance: number;
//     transactions: Transaction[];
// }

// export type Transaction = {
//     type: "Income" | "Expense" | "Transfer"; // The "Key" for your switch
//     id: string;
//     user_id: string;
//     date: string;
//     amount: number;
//     category?: string;
//     account_id: string;
//     note: string;
//     to_account_id?: string;

// }

// defines wt 'tools' are available in the system


interface AccountContextType {
    accounts: Account[];
    addAccount: (newAcc: AccountInsert) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    addTransaction: (newTrans: TransactionInsert) => Promise<void>;
    deleteTrans: (transId: string) => Promise<void>;
    getAccountById: (id: string | string[] | undefined) => Account | undefined;
    refreshData: () => Promise<void>;
    changeMonth: (amount: number) => void;
    updateTransaction: (updateTrans: UpdateTransaction) => Promise<void>;
    currentDate: Date;

    // Promise<void> - this tells the rest of the app "wait for me to finish talking to
    // the cloud before u move on"


}

/* create the context and give it a starting value of 'undefined'
like creating a unique 'channel', only components that specficially tune
into  AccountContext will be able to hear the datat u are brodcasting. */
const AccountContext = createContext<AccountContextType | undefined>(undefined);

// The provider that wraps the app
export const AccountProvider = ({ children }: { children: React.ReactNode }) => {


    // This is the GLOBAL memory for the entire app.
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const { user } = useAuth();
    console.log("Current User State:", user ? "Logged In" : "Logged Out/Null");
    // const refreshData = async () => {
    //     if (!user) return;
    //     try {
    //         const { data: accountsData, error } = await supabase
    //             .from('accounts')
    //             .select('*')
    //             .eq('user_id', user.id); // Filters the query to only return rows where user_id matches the logged-in user's ID
    //         const { data: transData } = await supabase
    //             .from('transactions')
    //             .select('*')
    //             .eq('user_id', user.id) // Only THIS user's data
    //         if (error) {
    //             throw error;
    //         }
    //         if (accountsData && transData) {
    //             const stitchedData = accountsData.map(account => {
    //                 const relatedTransactions = transData.filter(t =>
    //                     t.account_id === account.id || t.to_account_id === account.id

    //                 )
    //                 return {
    //                     ...account,
    //                     transactions: relatedTransactions
    //                 }

    //             })



    //             setAccounts(stitchedData as Account[]);
    //             // as Account[] - telling Typescript, i have checked the query
    //             // and i prommise the data matches our custom Account definition
    //         }
    //     }
    //     catch (error) {
    //         console.error("Refresh failed: ", (error as Error).message);
    //     }

    // }
    const refreshData = async () => {
        console.log("1. refreshData started. Current user:", user?.id);

        if (!user) {
            console.log("2. No user found, stopping fetch.");
            return;
        }

        try {
            const { data: accountsData, error: accError } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id);

            console.log("3. Accounts received:", accountsData?.length || 0);

            const { data: transData, error: transError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);

            console.log("4. Transactions received:", transData?.length || 0);

            if (accError) console.error("Database Error (Accounts):", accError.message);
            // Turn "Plaid Items" into "Accounts" so the app can read them

            if (accountsData) {

                // Stitching logic...
                const stitchedData = accountsData.map(account => {

                    // If account_id exists, it's a Plaid account. Use it.
                    // Otherwise, it's manual. Use the Supabase 'id'.
                    const lookupId = account.account_id || account.id;
                    const relatedTransactions = (transData || []).filter(t =>
                        t.account_id === lookupId
                    );
                    return { ...account, id: account.id, transactions: relatedTransactions };
                });

                console.log("5. Final stitched data count:", stitchedData.length);
                setAccounts(stitchedData as Account[]);
            }
        } catch (err) {
            console.error("6. Catch block error:", err);
        }
    };

    // Create a state to hold the timestamp
    //const [lastSynced, setLastSynced] = useState<string | null>(null);

    // This takes a new account and 'spreads' it into the old list


    /* For Local
   
     }*/
    //   const addAccount = (newAcc: Account) => {
    //  setAccounts((prev) => [...prev, newAcc])}

    const addAccount = async (newAcc: AccountInsert) => {
        // call supabase and ask it to save the new Account
        const { error } = await supabase
            .from('accounts')
            .insert(newAcc);
        // .select()
        // .single();


        if (error) {
            console.error('Add Account failed,', error.message);
            return; //stop here if it didnt work
        }
        refreshData();
    }

    // This creates a new list excluding the ID we want to remove
    const deleteAccount = async (id: string) => {
        // setAccounts(prev => prev.filter((acc) => acc.id !== id))
        // // filter() create a new list that includes every item except the
        // // one u want to get rid of 
        // // "Keep every item UNLESS its id matches the one I want to delete"

        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Delete failed:', error.message)
            return;
        }
        refreshData();

    }


    const addTransaction = async (newTrans: TransactionInsert) => {
        const { error } = await supabase
            .from('transactions')
            .insert(newTrans)

        if (error) {
            console.error('addTransaction failed:', error.message)
            return;
        }
        refreshData()


    }

    const deleteTrans = async (transId: string) => {
        const { error } = await supabase.
            from('transactions')
            .delete()
            .eq('id', transId)
        if (error) {
            console.error('deleteTransaction failed:', error.message)
            return;
        }
        refreshData()
    }


    const updateTransaction = async ({ id, ...rest }: UpdateTransaction) => {
        if (!id) {
            console.error('Cannot update transaction without an ID')
            return;
        }
        const { error } = await supabase.

            from('transactions')
            .update(rest)
            .eq('id', id)


        if (error) {
            console.error('updateTransaction failed:', error.message)
            return;
        }
        refreshData()
    }


    const getAccountById = (id: string | string[] | undefined) => {
        if (!id || Array.isArray(id))
            return undefined;
        return accounts.find(acc => acc.id === id)
    }



    const changeMonth = (amount: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + amount)
        setCurrentDate(newDate);
    }
    // const saveAccounts = async (accountsToSave: Account[]) => {
    //     try {
    //         // 1. Turn the Array into a String
    //         const stringData = JSON.stringify(accountsToSave)

    //         // 2. Write it to the phone's disk under a specific name ('storage_key')
    //         await AsyncStorage.setItem("TRACK_APP_DATA", stringData)


    //     } catch (e) {
    //         console.error("failed to save", e)
    //     }
    // }

    // const loadAccounts = async () => {

    //     // 1. Ask the phone for the data
    //     const stringData = await AsyncStorage.getItem("TRACK_APP_DATA")

    //     // 2. If it exists, turn it back into an Array. If not, return an empty list []
    //     return stringData ? JSON.parse(stringData) : []
    // }

    // This runs once when the app opens
    useEffect(() => {
        // This will log every time 'user' changes
        console.log("Auth Watcher - User is now:", user?.id || "Null");
        if (user) {

            refreshData()
        }
    }, [user] // empty brackets means "Only run when the app first turns on"
    )

    // // This runs everytime you add a transaction
    // useEffect(() => {
    //     if (accounts.length > 0) { // Only save if there's actually data to save!
    //         saveAccounts(accounts)
    //     }
    // }, [accounts] // only run when the 'accounts' array changed
    // )

    return (
        /* we 'provide' these three thigns to all the 'children' (the pages) */
        <AccountContext.Provider value={{ accounts, addAccount, deleteAccount, addTransaction, deleteTrans, getAccountById, refreshData, changeMonth, updateTransaction, currentDate }}>
            {children}
        </AccountContext.Provider>
    )

}

/* Instead of wrting useContext(AccountContext) everytime in the pages,
we make a shortcut function called useAccount */

export const useAccounts = () => {
    const context = useContext(AccountContext);

    // This is a safety check, it ensures we didnt forget to wrap
    // the app in the <AccountProvider> in the _layout.tsx
    if (!context) {
        throw new Error("useAccounts must be used within an AccountProvider")
    }
    return context;

}


export default AccountProvider;
