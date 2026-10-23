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

- `SmableAiChat` — celý chat: slot `header`, seznam zpráv (nebo `emptyState`), chipy `suggestions` dokud je konverzace prázdná, pole dotazu (`composer` propouští i `leading`, `trailing`, `recording`, `onRecordingChange`; na stránce jeden řádek jako dosud); `renderMessageExtra(message)` vykreslí obsah pod odpovědí asistenta (ne pod otázkou ani pod chybovou bublinou) — typicky karty `SmableAiActionCard`. Uvnitř `SmableAiWidget` čte jeho kontext: ve sbalené liště vykreslí jen pole dotazu (bez rámečku, jeden řádek, bez hintu) a odeslání lištu rozbalí
- `SmableAiActionCard` — karta změny, kterou asistent připravil ke schválení: titulek, řádky `rows` (položka, `before` → `after`; bez `before` jen nová hodnota, prázdný `before` ukáže „→ after“), volitelné `warning` a `note`; texty přes `SmableAiActionLabels`. `pending` ukáže Potvrdit / Zrušit (každé jen s callbackem), `busy: 'confirm' | 'cancel'` točí jmenované tlačítko a obě vypne (spinner sedí i po znovupřipojení karty); po kliknutí karta další kliky ignoruje, dokud konzument nenastaví `busy` nebo se nezmění `status`; ostatní stavy ukážou štítek `labels.statuses[status]` bez tlačítek, `failed` navíc `error`. `confirming` je záměrně bez tlačítek a bez spinneru (akce zaseknutá po pádu serveru by se točila navždy) — ikonu stavu točí jen `busy`. Přechod na štítek se hlásí čtečce a fokus z kliknutého tlačítka přejde na štítek (po nepovedeném pokusu — `busy` zhasne a akce dál čeká — pozdější změna stavu fokus nebere); `role="group"` s názvem `title`
- `SmableAiMessage`, `SmableAiMessageList` — bublina uživatele / odpověď se zdroji, odkazy do nápovědy (`https://`), palce (`aria-pressed`), chybová bublina se „Zkusit znovu“ (jen u poslední zprávy a ne během čekání); seznam roluje dolů při nové zprávě i při přepnutí konverzace, ukazuje běžící stav a čtečkám hlásí `labels.pending` / `labels.answered` (u chyby její text) v živé oblasti — obsah odpovědi se nikdy nepředčítá
- `SmableAiComposer` — pole dotazu: Enter odešle, Shift+Enter nový řádek, IME neodesílá, počítadlo znaků (`SMABLE_AI_MAX_CHARS`, `SMABLE_AI_COUNTER_FROM`); písmo 13 px na řádku 20 px, výška `minRows` (výchozí 1, jeden řádek svisle na středu tlačítka) až 6 řádků, posuvník až nad 6 řádků, výška se přeměří i při změně šířky pole; `bare` bez rámečku, pozadí, ringu a počítadla (chrome dodá obal); s `onRecordingChange` mikrofon před Odeslat — `recording` ukáže červený stop s pulzem (bez pulzu při `prefers-reduced-motion`) a placeholder `labels.listening`, tlačítko má stálý název `labels.dictate` s `aria-pressed` (při nahrávání `title` `labels.stopDictation`); do pole se nic nevkládá (přepis řeči zatím není)
- `SmableAiSuggestions` — chipy navržených otázek
- `SmableAiEmptyState` — prázdný stav; `rows` (stránka) / `chips` (widget)
- `SmableAiConversationList` — historie konverzací ve skupinách Dnes / Tento týden / Starší (`groupConversations`), mazání na hover
- `SmableAiCapabilities` — karta „Co asistent smí“ (sekce `read` / `write`, poznámka, patička)
- `SmableAiWidget` — plovoucí lišta ve stylu Shopify Sidekick, viz níže

#### `SmableAiWidget` — plovoucí lišta a panel

Widget je pořád vykreslený přes portál do `document.body` a mezi stavy přepíná jen třídy. Pole dotazu
je ve všech stavech **stejný uzel `textarea`** — text, kurzor, fokus i IME přežijí rozbalení,
sbalení i připnutí. Kořen je nemodální `role="region"` s názvem `labels.assistant`, bez backdropu
a bez pasti na fokus.

| Stav | Od `lg` | Pod `lg` |
|---|---|---|
| sbaleno (`float`, `expanded=false`) | lišta dole uprostřed obsahu, šířka min(480 px, 100 % − inset − 2rem), ~44 px vysoká: avatar · `leading` · pole (1 řádek) · `trailing` · mikrofon · Odeslat · oddělovač · Připnout (poslední dva jen s `onPlacementChange`) | kulatá ikona 52 px vpravo dole (`right-4 bottom-4`), pole dotazu je skryté jen přes CSS |
| panel (`placement='panel'`) | pevný panel vpravo, šířka `SMABLE_AI_PANEL_WIDTH` (420 px), jen 1px čára vlevo, bez stínu a zaoblení | celá obrazovka |
| karta (`float`, `expanded=true`) | záložní stav: karta min(560 px, …) × min(640 px, 100dvh − 2rem) roste nahoru ze stejného spodního okraje | celá obrazovka |

- **Píše se rovnou do lišty** — fokus ani psaní ji nerozbalí, mikrofon taky ne.
- **Rozbalení** spouští odeslání z lišty, klik na avatar a Připnout. Od `lg` (`matchMedia('(min-width: 1024px)')` v okamžiku akce) s `onPlacementChange` se konverzace otevře **v panelu** (`onPlacementChange('panel')` + `onExpandedChange(true)`), jinak jen `onExpandedChange(true)` — pod `lg` celá obrazovka, bez `onPlacementChange` karta. Kartu otevře i host přes `expanded=true`.
- **Hlavička** (rozbalený stav): přepínač historie s názvem (jen s `conversations` + `groupLabels`), Nová konverzace, Připnout (jen karta, jen od `lg` a jen s `onPlacementChange`; pod `lg` panel nikdy nenastaví), Celá stránka (jen s `onExpand`), vpravo Sbalit (`labels.collapse`, karta) nebo křížek (`labels.close`, panel). Panel přepínač připnutí nemá.
- **Sbalení karty**: šipka, Esc (jen s fokusem uvnitř, ne při `defaultPrevented`/`isComposing`; nejdřív zavře historii; zpracovaný Esc označí `preventDefault()`) nebo klik mimo kartu s `collapseOnOutsideClick` (výchozí `false`). Po sbalení je fokus v poli lišty; pod `lg`, kde je pole skryté, na ikoně (rozhoduje viditelnost pole, ne šířka okna). Klik mimo fokus neposouvá (a když host sbalení odmítne, další sbalení fokus vrací normálně).
- **Panel** zavře jen křížek: `onPlacementChange('float')` + `onExpandedChange(false)` a zpět je sbalená lišta. Esc v panelu jen zavře historii, klik mimo panel ho nezavře. Panel je vždy rozbalený, i když host pošle `expanded=false`.
- Esc v Selectu nebo `SmableDraweru` jinde na stránce widgetu nevadí; ohlášení odpovědí (`aria-live` v `SmableAiMessageList`) zůstává.
- Kontext `SmableAiWidgetContext` (`{ collapsed, expand }`) čte `SmableAiChat`; vlastní tělo widgetu ho může číst stejně.

**Co musí udělat host:**

- Vykreslit **jednu** instanci widgetu a měnit jen props — žádný `key` měněný podle umístění nebo konverzace a žádné podmíněné vykreslení podle stavu, jinak se pole dotazu připojí znovu.
- Nastavit CSS proměnné na `:root` nebo `body` — widget je v portálu v `body`, z obalu layoutu by je nezdědil. Všechny mají výchozí `0px`:

  | Proměnná | Co znamená | Kdo ji čte |
  |---|---|---|
  | `--smable-ai-inset-left` | šířka postranního menu vlevo | `SmableAiWidget` (lišta a karta se centrují na obsah: levý střed `inset + (100 % − inset) / 2`, bez transformace), `BulkActionsBar` |
  | `--smable-ai-inset-right` | šířka připnutého panelu vpravo — od `lg`, dokud je `placement === 'panel'`, `SMABLE_AI_PANEL_WIDTH` px | `BulkActionsBar` (centruje se mezi menu a panel) |
  | `--smable-ai-bar-reserve` | místo pro sbalenou lištu Smable AI dole — od `lg`, dokud je lišta vidět, např. `3rem` | `BulkActionsBar` (`bottom: calc(1.5rem + rezerva)`, stojí nad lištou) |

  Bez proměnných vypadá `BulkActionsBar` přesně jako dřív (`bottom: 1.5rem`, `left: 50%`).
- Od `lg`, dokud je `placement === 'panel'`, **zúžit obsah** o `SMABLE_AI_PANEL_WIDTH` — typicky `padding-right` na hlavním obalu obsahu. Panel je `fixed` a stránku sám neposouvá.
- Host s vlastním vstupem na mobilu může ikonu schovat přes `className` (např. `max-lg:hidden`, jen když je widget sbalený).
- Na stránce celé konverzace (`onExpand`) má tlačítko zmenšení od `lg` volat `onPlacementChange('panel')` — breakpoint je exportovaný jako `SMABLE_AI_DESKTOP_QUERY` (`(min-width: 1024px)`).

```tsx
<SmableAiWidget
  expanded={expanded}
  onExpandedChange={setExpanded}
  placement={placement}
  onPlacementChange={setPlacement}
  title={conversationTitle}
  onNewConversation={startNew}
  onExpand={() => navigate('/ai/chat')}
  labels={labels}
>
  <SmableAiChat messages={messages} pending={pending} labels={labels} renderContent={renderMarkdown} composer={composer} />
</SmableAiWidget>
```

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
