# @smable/ui

Shared UI components for the Smable platform.

Used by `app.smable.cz`, `partner.smable.cz`, `styleguide.smable.cz`, and other Smable projects.

## Installation

This package is hosted on **GitHub Packages** (private). Each consumer project needs a `.npmrc` configured and a GitHub PAT with `read:packages` scope.

### 1. Create `.npmrc` in the consumer project root

```
@smable:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Do **not** commit the token — reference an env var.

### 2. Set the env var locally

Windows (PowerShell, persistent):

```powershell
[Environment]::SetEnvironmentVariable("GITHUB_PACKAGES_TOKEN", "<your_pat>", "User")
```

macOS / Linux (zsh/bash):

```bash
export GITHUB_PACKAGES_TOKEN=<your_pat>
```

### 3. Install

```bash
npm install @smable/ui
```

## Usage

```tsx
import { SmableButton, SmableInput } from '@smable/ui'

export function LoginForm() {
  return (
    <form>
      <SmableInput label="Email" type="email" />
      <SmableButton variant="primary">Log in</SmableButton>
    </form>
  )
}
```

### Tailwind preset

Extend your project's `tailwind.config.js` with the Smable preset so your app uses the same design tokens as the components:

```js
import smablePreset from '@smable/ui/tailwind.preset'

export default {
  presets: [smablePreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@smable/ui/dist/**/*.{js,mjs}',
  ],
}
```

The `node_modules/@smable/ui/dist/**` glob is **required** so Tailwind scans the published component classes.

## Components

- `SmableButton` — primary / secondary / ghost variants, sizes, loading state
- `SmableInput` — floating-label text input
- `SmableSelect` — floating-label native select
- `SmableTextarea` — floating-label textarea
- `SmableDatePicker` — date / datetime / range picker (requires `react-day-picker`, `date-fns`)
- `SmableDrawer` — side drawer / modal
- `SmableActionsMenu` — dropdown action menu
- `DataTable` — TanStack tabulka: řazení, filtry, stránkování (i serverové), hromadný výběr podle id
  (`getRowId`, `canSelectRow`, Shift + klik, menu Stránku / Vše podle filtru), lepivá hlavička, hustota, export
- `DataTableBulkSelect`, `DataTableDensityMenu`, `DataTableColumnsMenu`, `DataTableExport` — díly DataTable pro vlastní TanStack instance
- `Checkbox` — včetně `indeterminate` a `disabled`
- `FlowFunnel` — tok ve stylu Sankey (funnel): hlavní pás, větve konverze / bez konverze, samostatné
  uzly bez pásu (`side`), procenta vždy k nadřazenému uzlu; rozložení počítá čistá funkce `layoutFlowFunnel`

### Pokladna (`pos/`)

- `PosStatusBadge` — pilulka se stavovou tečkou (pokladna otevřena, tiskárna neodpovídá)
- `PosTabBar` — hlavní záložky Pokladna / Transakce / Uzávěrka; `fluid` — přes celou šířku, stejně široké záložky (telefon, na výšku)
- `PosSegmentedControl` — přepínač Knihovna / Kalkulačka, 80/58 mm
- `PosCategoryItem` — položka kategorie v levém sloupci prodejní plochy; volitelná `icon` a `description` — navigace Nastavení (ikona + stav)
- `PosItemTile` — dlaždice položky, barva čitelná i na žluté (viz `readableTextClass`); volitelné `image` + `imageFit`, `showPrice`, `stock`; `size` (`xs` / `s` / `l`) + `stockLevel` zapíná dlaždici v2
- `PosSearchInput` — vyhledávání / pole čtečky s klávesovou zkratkou
- `PosCartRow` — řádek účtu s krokováním množství
- `PosActionButton` — Zaplatit / Uložit / Storno se zkratkou
- `PosCodeInput` — políčka kódu párování a PINu; `fluid` — na šířku rodiče (telefon)
- `PosKeypad` — numerická klávesnice; `fluid` — na šířku rodiče (telefon)
- `PosCashPill` — rychlá bankovka pro dorovnání hotovosti
- `PosStatTile` — statistická dlaždice uzávěrky (tržba, počet účtenek)
- `PosKeyValueRow` — řádek popisek/hodnota v detailu účtenky
- `PosPanel` — bílá karta se záhlavím (uzávěrka, detail účtenky, nastavení)
- `PosTransactionRow` — řádek seznamu účtenek
- `PosSheet` — spodní panel pro podobu na výšku (účet, detail položky)
- `PosKbd` — klávesová zkratka (`Enter`, `Esc`, `F2`)
- `readableTextClass(hex)` — vybere čitelnou barvu textu (bílá/tmavá) na barevné dlaždici

### Smable AI (`smable-ai/`)

Prezentační díly asistenta Smable AI — texty přes `labels` (`SmableAiLabels`), obsah odpovědi přes
`renderContent`, data a akce přes props a callbacky (žádný fetch ani i18n). Figma: stránka „Zeptat se“
[`171-2559`](https://www.figma.com/design/7QGTOfcL7RrYC5MfaMg7HT/Smable-UI?node-id=171-2559),
widget [`273-1833`](https://www.figma.com/design/7QGTOfcL7RrYC5MfaMg7HT/Smable-UI?node-id=273-1833),
karta změny [`115-1626`](https://www.figma.com/design/7QGTOfcL7RrYC5MfaMg7HT/Smable-UI?node-id=115-1626).

- `SmableAiChat` — celý chat: slot `header`, seznam zpráv (nebo `emptyState`), chipy `suggestions` dokud je konverzace prázdná, pole dotazu; `renderMessageExtra(message)` vykreslí obsah pod odpovědí asistenta (ne pod otázkou ani pod chybovou bublinou) — typicky karty `SmableAiActionCard`
- `SmableAiActionCard` — karta změny, kterou asistent připravil ke schválení: titulek, řádky `rows` (položka, `before` → `after`; bez `before` jen nová hodnota), volitelné `warning` a `note`; texty přes `SmableAiActionLabels`. `pending` ukáže Potvrdit / Zrušit (každé jen s callbackem), `busy` točí kliknuté tlačítko a druhé vypne; ostatní stavy ukážou štítek `labels.statuses[status]` bez tlačítek, `failed` navíc `error`. `confirming` je záměrně bez tlačítek a bez spinneru (akce zaseknutá po pádu serveru by se točila navždy) — ikonu stavu točí jen `busy`. Přechod na štítek se hlásí čtečce a fokus z kliknutého tlačítka přejde na štítek; `role="group"` s názvem `title`
- `SmableAiMessage`, `SmableAiMessageList` — bublina uživatele / odpověď se zdroji, odkazy do nápovědy (`https://`), palce (`aria-pressed`), chybová bublina se „Zkusit znovu“ (jen u poslední zprávy a ne během čekání); seznam roluje dolů při nové zprávě i při přepnutí konverzace, ukazuje běžící stav a čtečkám hlásí `labels.pending` / `labels.answered` (u chyby její text) v živé oblasti — obsah odpovědi se nikdy nepředčítá
- `SmableAiComposer` — pole dotazu: Enter odešle, Shift+Enter nový řádek, IME neodesílá, počítadlo znaků (`SMABLE_AI_MAX_CHARS`, `SMABLE_AI_COUNTER_FROM`)
- `SmableAiSuggestions` — chipy navržených otázek
- `SmableAiEmptyState` — prázdný stav; `rows` (stránka) / `chips` (widget)
- `SmableAiConversationList` — historie konverzací ve skupinách Dnes / Tento týden / Starší (`groupConversations`), mazání na hover
- `SmableAiCapabilities` — karta „Co asistent smí“ (sekce `read` / `write`, poznámka, patička)
- `SmableAiWidget` — plovoucí karta přes portál do `document.body`: od `lg` 400 × min(720 px, 100dvh − 92 px) vpravo dole 72 px nad okrajem, pod `lg` celá obrazovka, bez backdropu; `role="dialog"` s názvem `labels.assistant`; Esc s fokusem uvnitř karty zavře nejdřív historii, potom widget (Esc v Selectu nebo SmableDraweru na stránce kartu nezavře); po zavření se fokus vrací na spouštěč; historie jen s `conversations` + `groupLabels`, rozbalení jen s `onExpand`

## Publishing a new version

1. Bump version in `package.json`: `npm version patch|minor|major`
2. Push the tag: `git push origin main --tags`
3. GitHub Actions (`.github/workflows/publish.yml`) runs typecheck + build + publish to GitHub Packages

## Development

```bash
npm install
npm run dev       # watch mode
npm run build     # one-shot build
npm run typecheck
```

## Peer dependencies

Consumers must install:

- `react@^18`, `react-dom@^18`
- `clsx@^2`
- `lucide-react@^0.312`

Optional (only if using `SmableDatePicker`):

- `date-fns@^4`
- `react-day-picker@^9`
