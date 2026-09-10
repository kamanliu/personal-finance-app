export function getTransferLabel(
    item: any,
    getAccountById: (id?: string) => any,
    getAccountByPlaidId: (id: string) => any
) {
    const fromAccount = item.source === 'plaid'
        ? getAccountByPlaidId(item.account_id)
        : getAccountById(item.account_id);

    const toAccount = item.source === 'plaid'
        ? getAccountByPlaidId(item.to_account_id || '')
        : getAccountById(item.to_account_id || undefined);

    return `${fromAccount?.name || 'Unknown'} ➪ ${toAccount?.name || 'Unknown'}`;
}