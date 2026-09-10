export const plaidCategoryAliases: Record<string, string> = {
    "TRANSFER_OUT": "transfer out",
    "TRANSFER_IN": "transfer in",
    "PERSONAL_CARE": "health",
    "TRAVEL": "travel",
    "FOOD_AND_DRINK": "food",
    "GENERAL_MERCHANDISE": "shopping",
    "TRANSPORTATION": "transportation",
    "RENT_AND_UTILITIES": "housing",
    "LOAN_PAYMENTS": "loan payments",
};
export function normalizePlaidCategory(rawCategory: string): string {
    return plaidCategoryAliases[rawCategory] ?? rawCategory.toLowerCase().replace(/_/g, ' ');
} 