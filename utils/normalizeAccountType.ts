export function normalizeAccountType(type: string): string {
    const map: Record<string, string> = {
        credit: 'card',
    };
    const lower = type?.toLowerCase() ?? '';
    return map[lower] ?? lower;
}