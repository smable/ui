export interface FileLike {
  name: string
  type: string
}

/**
 * Odpovídá soubor atributu `accept`? Přípony (`.csv`) bez ohledu na velikost písmen — bankovní
 * výpisy `.gpc` / `.abo` mají prázdný MIME typ. Dále přesný MIME (`image/png`) a skupina
 * (`image/*`). Prázdné `accept` povolí vše.
 */
export function matchesAccept(file: FileLike, accept?: string | null): boolean {
  const tokens = (accept ?? '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length === 0) return true
  const name = file.name.toLowerCase()
  const type = (file.type || '').toLowerCase()
  return tokens.some((token) => {
    if (token === '*' || token === '*/*') return true
    if (token.startsWith('.')) return name.endsWith(token)
    if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1))
    return type === token
  })
}
