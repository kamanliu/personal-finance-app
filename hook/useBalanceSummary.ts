// hook/useBalanceSummary.ts
import { useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';

export function useBalanceSummary() {
    const { accounts } = useAccounts();
    const balanceSummary = useMemo(() => {
        return accounts.reduce((accumulator, account) => {
            const bal = account.balance || 0;

            if (account.type === 'credit' || account.type === 'loan') {
                accumulator.liabilities += bal;
                accumulator.total -= bal;
            }
            if(bal<0){
                accumulator.liabilities += bal;
                accumulator.total += bal;
            }
            else {
                accumulator.assets += bal;
                accumulator.total += bal;
            }


            return accumulator

        }, { assets: 0, liabilities: 0, total: 0 })
    }, [accounts])
    return balanceSummary;
}
