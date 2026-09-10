export function groupTransactionsByDate(transactions: any[]) {
    const grouped = transactions.reduce((acc, item) => {
        const dateKey = new Date(item.date).toDateString(); // normalizes away time component
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, any[]>);

    return Object.keys(grouped).map(date => ({
        title: date,
        data: grouped[date],
    }));
}