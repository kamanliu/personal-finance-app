export function formatCategory(category: string | null) {
  return (category || "Uncategorized").split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase())
        .join(" ")
}