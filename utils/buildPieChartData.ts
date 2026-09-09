
import { CategoryIcon } from "./IconCircle";
export function buildPieChartData(transaction: any[], type: string) {
    const filtered = transaction.filter(item => item.type === type);
    const byCategory = filtered.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = 0
        }
        acc[item.category] += item.amount;
        return acc

    }, {} as Record<string, number>)


    return Object.keys(byCategory).map(category => ({
        categoryName: category,
        value: byCategory[category],
        color: (CategoryIcon[category] || { iconColor: "#797979" }).iconColor
    }))
}