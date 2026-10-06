# DataTable — enterprise vzory

Doplnění `DataTable` o chování, které je v [PatternFly — bulk selection](https://www.patternfly.org/patterns/bulk-selection/)
a [Pencil & Paper — enterprise data tables](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables)
zavedené a `DataTable` ho dosud neměl. Zdroj zadání: proklikávací prototyp schvalování
(Content Studio, 1 000 řádků) — chování se tam odladilo na reálné obrazovce a odsud se
přenáší do kitu.

Komponentu konzumuje devět aplikací, takže **každá nová volba je vypnutá nebo se chová jako dosud**,
až na tři výjimky vypsané níže.

## Co se přidává

| Prop | Výchozí | Co dělá |
|---|---|---|
| `bulkSelectMenu` | `false` | Šipka u zaškrtávátka v hlavičce: *Stránku (N)* / *Vše podle filtru (N)* / *Zrušit výběr*. Klik přímo do zaškrtávátka dál bere celý filtr. |
| `allFilteredCount` | — | Při `manualPagination` kolik řádků filtru odpovídá na serveru (tabulka zná jen načtenou stránku). |
| `onSelectAllFiltered` | — | Při `manualPagination` si výběr napříč stránkami musí obstarat stránka — tabulka jen zavolá tohle. |
| `rangeSelect` | `true` | Shift + klik označí vše mezi posledním a tímto řádkem. Bez shiftu se nic nemění. |
| `stickyHeader` | `false` | Hlavička drží při svislém posunu. Zapíná `overflow-auto` a `maxBodyHeight`. |
| `maxBodyHeight` | `'60vh'` | Jen se `stickyHeader`. |
| `density` / `onDensityChange` | `'normal'` | Výška řádku `compact` / `normal` / `relaxed`. `normal` = dnešní `py-4`. |
| `densityToggle` | `false` | Přepínač hustoty v nástrojové liště. |
| `filterChips` | `false` | Aktivní filtry jako odznaky pod nástroji, každý se křížkem. |
| `onGlobalFilterClear` | — | Bez něj se odznak pro hledání nezobrazí (hodnotu drží stránka). |
| `loading` / `skeletonRows` | `false` / `pageSize` | Kostra řádků ve stejných sloupcích jako data. |
| `emptyFilteredTitle`, `emptyFilteredDescription`, `onClearFilters` | — | Prázdno podle filtru má jiný text a cestu ven než prázdný dataset. |
| `announceSelection` | `true` | Změna výběru a počtu řádků jde do `aria-live`. |

## Tři změny, které se projeví i bez zapnutí propu

Jsou to opravy, ne nové chování — proto bez vlastního přepínače. Pokud je někde nechceme,
je to k vetu teď, ne po vydání.

1. **Šipka řazení je vidět vždycky, jen zašedlá.** Dnes je `opacity-0` a objeví se až při přejetí
   myší, takže na dotyku a při prvním pohledu o možnosti řadit nikdo neví.
2. **Prázdný stav se táhne přes správný počet sloupců.** `colSpan={columns.length}` je chyba —
   ignoruje `select` sloupec i skryté sloupce, takže prázdný text sedí vedle, ne na střed.
   Nově `table.getVisibleLeafColumns().length`.
3. **`aria-sort` na hlavičce, neurčitý stav zaškrtávátka, klávesová obsluha klikacího řádku.**
   Řádek s `onRowClick` je nově `tabindex="0"` + `role="button"` a reaguje na Enter a mezerník;
   dosud byl pro klávesnici neviditelný. Do výjimek v `onRowClick` se přidává `label`, aby klik
   do zaškrtávátka neodnavigoval.

## Co se nepřidává

- **Strop výběru** (`vyberStrop` z prototypu) — má smysl jen tam, kde se id posílají na server
  v jednom požadavku. To je věc stránky, ne tabulky; `onSelectAllFiltered` jí na to dává místo.
- **Uložené pohledy** a **tahání za okraj sloupce** — samostatné téma, `usePersistentTableState`
  na pohledy zatím nestačí.
- **Kontextová lišta místo nástrojové.** `BulkActionsBar` a `SelectionBar` už existují a používají
  se, takže lištu akcí nad výběrem řeší dál ony.

## Nové soubory

- `src/components/DataTableBulkSelect.tsx` — zaškrtávátko v hlavičce + nabídka výběru
- `src/components/DataTableDensityMenu.tsx` — přepínač hustoty
- `src/components/DataTableFilterChips.tsx` — odznaky aktivních filtrů

Všechny tři jdou použít i samostatně nad vlastní TanStack instancí — stejný vzor jako
`DataTableColumnsMenu` a `DataTableExport`.

## Zbývá

- Přidat do `styleguide.smable.cz` ve stejném PR (pravidlo z `CLAUDE.md`).
- Bump verze + tag `v*` dělá release, ne tento PR.
