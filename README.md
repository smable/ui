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
