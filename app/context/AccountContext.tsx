import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

/* Set up a 'system' for the app, by moving the state to a central file,
this allow any page to 'read' or 'write' to the account list simultaneosly */


// defines the shape of a single account object
export type Account = {
    id: string
    type: string;
    name: string;
    balance: number;
    transactions: Transaction[];
}

export type Transaction = {
    type: "Income" | "Expense" | "Transfer"; // The "Key" for your switch
    id: string;
    date: string;
    amount: number;
    category: string;
    account: string;
    note: string;
    toAccount?: string;

}

// defines wt 'tools' are available in the system
interface AccountContextType {
    accounts: Account[];
    addAccount: (newAcc: Account) => void;
    deleteAccount: (id: string) => void;
    addTransaction: (accountId: string, newTrans: Transaction) => void;

    //lastSynced: string | null; 

}


/* create the context and give it a starting value of 'undefined'
like creating a unique 'channel', only components that specficially tune
into  AccountContext will be able to hear the datat u are brodcasting. */
const AccountContext = createContext<AccountContextType | undefined>(undefined);

// The provider that wraps the app
export const AccountProvider = ({ children }: { children: React.ReactNode }) => {

    // This is the GLOBAL memory for the entire app.
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Create a state to hold the timestamp
    //const [lastSynced, setLastSynced] = useState<string | null>(null);

    // This takes a new account and 'spreads' it into the old list
    const addAccount = (newAcc: Account) => {
        setAccounts((prev) => [...prev, newAcc])
    }

    // This creates a new list excluding the ID we want to remove
    const deleteAccount = (id: string) => {
        setAccounts(prev => prev.filter((acc) => acc.id !== id))
        // filter() create a new list that includes every item except the
        // one u want to get rid of 
        // "Keep every item UNLESS its id matches the one I want to delete"

    }

    const addTransaction = (id: string, newTrans: Transaction) => {
        setAccounts((prev) =>
            prev.map((acc) => {
                switch (newTrans.type) {
                    case "Income":
                        if (acc.id == id) {
                            return {

                                ...acc,
                                balance: acc.balance + newTrans.amount,
                                transactions: [newTrans, ...acc.transactions]
                            }
                        } break
                    case "Expense":
                        if (acc.id == id) {
                            return {

                                ...acc,
                                balance: acc.balance - newTrans.amount,
                                transactions: [newTrans, ...acc.transactions]
                            }
                        } break

                    case "Transfer":
                        if (acc.id === newTrans.account){
                               return {

                                ...acc,
                                balance: acc.balance - newTrans.amount,
                                transactions: [newTrans, ...acc.transactions]
                            }
                        }
                        if (acc.id === newTrans.toAccount){
                             return {

                                ...acc,
                                balance: acc.balance + newTrans.amount,
                                transactions: [newTrans, ...acc.transactions]
                            }
                        }break


                }
                return acc

            }
            )
        )


    }


    const saveAccounts = async (accountsToSave: Account[]) => {
        try {
            // 1. Turn the Array into a String
            const stringData = JSON.stringify(accountsToSave)

            // 2. Write it to the phone's disk under a specific name ('storage_key')
            await AsyncStorage.setItem("TRACK_APP_DATA", stringData)


        } catch (e) {
            console.error("failed to save", e)
        }
    }

    const loadAccounts = async () => {

        // 1. Ask the phone for the data
        const stringData = await AsyncStorage.getItem("TRACK_APP_DATA")

        // 2. If it exists, turn it back into an Array. If not, return an empty list []
        return stringData ? JSON.parse(stringData) : []
    }

    // This runs once when the app opens
    useEffect(() => {
        const initialize = async () => {
            const saved = await loadAccounts()
            setAccounts(saved)
            // put the loaded data into your context state
        }
        initialize()
    }, [] // empty brackets means "Only run when the app first turns on"
    )

    // This runs everytime you add a transaction
    useEffect(() => {
        if (accounts.length > 0) { // Only save if there's actually data to save!
            saveAccounts(accounts)
        }
    }, [accounts] // only run when the 'accounts' array changed
    )

    return (
        /* we 'provide' these three thigns to all the 'children' (the pages) */
        <AccountContext.Provider value={{ accounts, addAccount, deleteAccount, addTransaction }}>
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
