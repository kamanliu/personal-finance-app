import React, { createContext, useContext, useState } from 'react';

/* Set up a 'system' for the app, by moving the state to a central file,
this allow any page to 'read' or 'write' to the account list simultaneosly */


// defines the shape of a single account object
export type Account = {
    id: string
    type: string;
    name: string;
    amount: number;
  }
  
// defines wt 'tools' are available in the system
interface AccountContextType {
    accounts: Account[];
    addAccount: (newAcc: Account) => void;
    deleteAccount: (id: string) => void;
}

/* create the context and give it a starting value of 'undefined'
like creating a unique 'channel', only components that specficially tune
into  AccountContext will be able to hear the datat u are brodcasting. */
const AccountContext = createContext<AccountContextType | undefined>(undefined);

// The provider that wraps the app
export const AccountProvider = ({ children }: {children: React.ReactNode}) =>{
    
    // This is the GLOBAL memory for the entire app.
    const [accounts, setAccounts] = useState<Account[]>([]);

    // This takes a new account and 'spreads' it into the old list
    const addAccount = (newAcc: Account) => {
        setAccounts((prev)=> [...prev, newAcc])
    }

    // This creates a new list excluding the ID we want to remove
    const deleteAccount = (id: string) => {
        setAccounts(prev => prev.filter((acc) => acc.id !== id))
        // filter() create a new list that includes every item except the
        // one u want to get rid of 
        // "Keep every item UNLESS its id matches the one I want to delete"
   
  }
  
  return (
    /* we 'provide' these three thigns to all the 'children' (the pages) */
    <AccountContext.Provider value = {{accounts, addAccount, deleteAccount}}>
        {children}
    </AccountContext.Provider>
)

}

/* Instead of wrting useContext(AccountContext) everytime in the pages,
we make a shortcut function called useAccount */

export const useAccounts = () =>{
    const context = useContext(AccountContext);

    // This is a safety check, it ensures we didnt forget to wrap
    // the app in the <AccountProvider> in the _layout.tsx
    if (!context){
        throw new Error("useAccounts must be used within an AccountProvider")
    }
    return context;

}

export default AccountProvider;
