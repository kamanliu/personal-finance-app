export const expenseCategoryType = ["Food", "Grocery", "Transportation", "Telephone", "Subscription",
        "Housing", "Shopping", "Entertainment", "Health", "Travel", "Utilities", "Loan Payments", "Transfer Out", "Bank Fees", "Other"]
export const incomeCategoryType = ["Salary", "Bonus", "Allowance", "Investment", "Transfer In", "Other"]

export function normalizeCategory(category: string, type: 'Income' | 'Expense'): string {
    const list = type === 'Income' ? incomeCategoryType : expenseCategoryType;
    const match = list.find(c => c.toLowerCase() === category?.toLowerCase());
    return match ?? 'Other';
}