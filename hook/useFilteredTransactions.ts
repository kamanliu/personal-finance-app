import { useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';

export function useFilteredTransactions(rawTransactions: any[], accountId?: string, plaidAccountId?: string ) {
  // ? means optional
  const { currentDate } = useAccounts();
  const sortedTransactions = useMemo(() => {
    if (!rawTransactions) return {
      displayTransactions: [],
      deposit: 0,
      withdrawl: 0,
      total: 0
    };

    // remove the duplicates (mainly for transfers)
    const unique = rawTransactions.filter((trans, index, self) => self.findIndex(t => t.id === trans.id) === index)
    const filtered = unique.filter((trans) => {

      const transDate = new Date(trans.date || 0)
      const isCorrectMonth =
        transDate.getMonth() === currentDate.getMonth() &&
        transDate.getFullYear() === currentDate.getFullYear();


      //  a ternary operator (? :), which is like an if/else on one line.
      // const result = condition ? valueIfTrue : valueIfFalse;
      const isCorrectAccount = accountId ? (trans.type === 'Transfer'
        ? trans.account_id === accountId || trans.account_id === plaidAccountId || trans.to_account_id === accountId
        : trans.account_id === accountId || trans.account_id === plaidAccountId)
        : true;
      //console.log('Transaction:', trans.id, 'Type:', trans.type, 'From:', trans.account_id, 'To:', trans.to_account_id, 'AccountId:', accountId, 'Passes:', isCorrectMonth && isCorrectAccount);
      return isCorrectMonth && isCorrectAccount
    })
    // sort the merges list by date (descending: newest first)

    const transSummary = filtered.reduce((acc, item) => {

      const amt = Number(item.amount) || 0;
      if (item.type === 'Income' || item.type === 'income') {
        acc.deposit += amt
        acc.total += amt


      }
      else if (item.type === 'Expense' || item.type === 'expense') {
        acc.withdrawl += amt
        acc.total -= amt

      }
      else {
        if (item.account_id === accountId) {
          acc.withdrawl += amt
          acc.total -= amt
        }
        if (item.to_account_id === accountId) {
          acc.deposit += amt
          acc.total += amt
        }
      }

      return acc

    }, { deposit: 0, withdrawl: 0, total: 0 })

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;

    })
    return {
      displayTransactions: sorted,
      deposit: transSummary.deposit,
      withdrawl: transSummary.withdrawl,
      total: transSummary.total,
    };


  }, [rawTransactions, currentDate, accountId]) // This only recalculates if the 'accounts' data changes'
  return sortedTransactions;

}
