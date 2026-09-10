import { normalizeCategory } from "../app/constants/categories";
import { CategoryIcon } from "./IconCircle";

export function buildPieChartData(transaction: any[], type: string) {
    const filtered = transaction.filter(item => item.type === type);

    const byCategory = filtered.reduce((acc, item) => {
        const normalized = normalizeCategory(item.category, type as 'Income' | 'Expense');
        if (!acc[normalized]) {
            acc[normalized] = 0
        }
        acc[normalized] += item.amount;
        return acc
    }, {} as Record<string, number>)

    return Object.keys(byCategory).map(category => {
        const normalizedKey = category.toLowerCase().replace(/[_-]/g, ' ').trim();
        return {
            categoryName: category,
            value: byCategory[category],
            color: CategoryIcon[normalizedKey]?.iconColor ?? '#9ca3af'
        };
    })
}