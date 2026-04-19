# Changelog

All notable changes to `@smable/ui`.

## 0.3.0 — 2026-04-18

### ⚠️ BREAKING CHANGES

`SmableInput`, `SmableSelect` a `SmableTextarea` byly **odstraněny**
a sloučeny do shared primitivů `Input`, `Select` a `Textarea`
s novým propem `variant: 'default' | 'floating'`.

Důvod: prefix `Smable*` vznikl historicky z doby, kdy komponenty
žily vedle raw HTML ve `app.smable.cz`. V samostatném balíčku
`@smable/ui` je prefix redundantní a paralelní existence dvou
primitivů pro stejnou věc (label-above vs. floating label) byla
matoucí. Jeden primitiv s `variant` propem je čistší.

### Migrace (pro konzumenty)

```diff
- import { SmableInput, SmableSelect, SmableTextarea } from '@smable/ui'
+ import { Input, Select, Textarea } from '@smable/ui'

- <SmableInput label="Email" type="email" value={v} onChange={...} />
+ <Input variant="floating" label="Email" type="email" value={v} onChange={...} />

- <SmableSelect label="Segment" value={v} onChange={...}>…</SmableSelect>
+ <Select variant="floating" label="Segment" value={v} onChange={...}>…</Select>

- <SmableTextarea label="Poznámka" rows={5} value={v} onChange={...} />
+ <Textarea variant="floating" label="Poznámka" rows={5} value={v} onChange={...} />
```

### Chování proopů

Floating varianta si zachovává všechny propy původních `Smable*`
komponent (`label`, `error`, `size: 'medium' | 'large'`, `trailing`
u Inputu). `required` nyní generuje `*` za floating labelem
(dříve to dělal volající).

Default varianta je beze změny (původní lightweight `Input`/`Select`/`Textarea`).

### Dotčené konzumenty

- `app.smable.cz` — 22 výskytů `SmableInput/Select/Textarea` na ~5 místech (auth, onboarding). Vyžaduje migraci.
- `partner.smable.cz` — 49 výskytů na ~6 místech (auth, lead form, profile). Vyžaduje migraci.
- `styleguide.smable.cz` — migrace provedena spolu s 0.3.0 releasem.

### Beze změny

- `SmableButton`, `SmableDrawer`, `SmableActionsMenu`, `SmableDatePicker`
  zůstávají nadále pod `Smable*` prefixem (nemají „lightweight twin",
  který by dával smysl sloučit).

---

## 0.2.0 — 2026-04-18

Big bump — všechny sdílené primitivy z `app.smable.cz` a `partner.smable.cz`
přesunuty do `@smable/ui`.

- Přidáno: `AlertBanner`, `BulkActionsBar`, `Checkbox`, `DataTable`,
  `DataTableExport`, `DateRangePicker`, `EmptyState`, `ExportMenu`,
  `HeroCard`, `IconSelect`, `Input`, `KanbanBoard`, `ListPageHeader`,
  `LoadingOverlay`, `Pagination`, `QuickActions`, `SearchBar`,
  `SectionTitle`, `Select`, `SelectionBar`, `StatusTabs`, `Textarea`,
  `Toggle`, `ViewToggle`
- Přidáno: `normalize`, `smartMatch`, `smartFilter` (Czech diacritics-safe search)
- Přidáno: optional peer deps (`@tanstack/react-table`, `file-saver`,
  `jspdf`, `jspdf-autotable`, `react-tailwindcss-datepicker`, `xlsx`)

## 0.1.0 — 2026-04-17

Initial release — `SmableButton`, `SmableInput`, `SmableSelect`,
`SmableTextarea`, `SmableDatePicker`, `SmableDrawer`, `SmableActionsMenu`
+ tailwind preset.
