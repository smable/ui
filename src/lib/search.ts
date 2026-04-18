/**
 * Smart search utility
 * - Case insensitive
 * - Diacritics insensitive (č → c, ř → r, ž → z, etc.)
 * - Multi-word: all terms must match
 */

const DIACRITICS_MAP: Record<string, string> = {
  'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a',
  'č': 'c', 'ć': 'c',
  'ď': 'd',
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e', 'ě': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
  'ň': 'n', 'ñ': 'n',
  'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o',
  'ř': 'r',
  'š': 's',
  'ť': 't',
  'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u', 'ů': 'u',
  'ý': 'y', 'ÿ': 'y',
  'ž': 'z',
}

export function normalize(str: string): string {
  return str.toLowerCase().replace(/[^\x00-\x7F]/g, char => DIACRITICS_MAP[char] || char)
}

export function smartMatch(haystack: string, query: string): boolean {
  if (!query) return true
  const normalizedHaystack = normalize(haystack)
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  return terms.every(term => normalizedHaystack.includes(term))
}

export function smartFilter<T>(items: T[], query: string, getSearchableText: (item: T) => string): T[] {
  if (!query) return items
  return items.filter(item => smartMatch(getSearchableText(item), query))
}
