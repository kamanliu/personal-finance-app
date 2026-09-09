
import { Budget } from '@/context/AccountContext';
export function findBudgetByCategory(budgets: Budget[], category: string) {
    return budgets.find(b => b.category === category);
}