export function calculateAccountBalance(rawTransactions: any[], accountId?: string | null) {


    if (!rawTransactions) return {
        displayTransactions: [],
        deposit: 0,
        withdrawl: 0,
        total: 0
    };

    const unique = rawTransactions.filter((trans, index, self) => self.findIndex(t => t.id === trans.id) === index )

    const transSummary = unique.reduce((acc, item) => {

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
    return {

        deposit: transSummary.deposit,
        withdrawl: transSummary.withdrawl,
        total: transSummary.total,
    };



}