# CLAUDE.md — smable-ui (`@smable/ui`)

Sdílené React komponenty pro celou Smable suite. Konzumují je `app.smable.cz`, `help-v2.smable.cz`,
`partner.smable.cz`, `crm.smable.cz`, `fakturace-cockpit.smable.cz`, `helpdesk.smable.cz`,
`developer.smable.cz`, `mailbox.smable.cz`, `styleguide.smable.cz`.

Nová nebo upravená sdílená komponenta patří **sem**, nikdy do konzumenta. Do styleguide se přidává
ve stejném PR.

## Push a publish — dvě různé autentizace

Tohle je jediné repo v monorepu hostované na GitHubu (ostatní jedou na `server.smable.cz`).
Naráží proto na dvě pasti, které stály několik hodin.

### Git push: musí jít pod účtem `smable`, ne `praguebestcz`

Na stroji jsou **dva GitHub účty**. Výchozí `github.com` se autentizuje jako `praguebestcz`,
který na `smable/ui` **nemá práva zápisu** — push skončí:

```
remote: Permission to smable/ui.git denied to praguebestcz
fatal: ... The requested URL returned error: 403
```

Správný účet má v `~/.ssh/config` vlastní alias s vlastním klíčem:

```
Host github-smable
    HostName github.com
    IdentityFile ~/.ssh/id_ed25519_smable
```

Ověření: `ssh -T github-smable` musí odpovědět `Hi smable!` (ne `Hi praguebestcz!`).

Jenže **git globálně používá PuTTY plink** (`core.sshCommand` v `~/.gitconfig`), a plink
`~/.ssh/config` nečte — na alias odpoví `Unable to open connection: Host does not exist`.
Proto má tohle repo dva **lokální** overridy (nesahat na globální konfiguraci, rozbila by
ostatní repa, která na plink spoléhají):

```bash
git remote set-url origin git@github-smable:smable/ui.git
git config --local core.sshCommand "'C:/Program Files/Git/usr/bin/ssh.exe'"
```

Obojí je v `.git/config`, takže po klonu na jiném stroji je nutné je nastavit znovu.

### Publish: přes tag, ne lokálně

**Lokální `npm publish` nezkoušej.** Všechny místní tokeny pro `npm.pkg.github.com` jsou
neplatné (401) — v `~/.npmrc`, v `.npmrc` napříč repy i v env `GITHUB_PACKAGES_TOKEN`.
Historicky se PAT v secretu opakovaně rozpadl, proto publish jede v CI přes vestavěný
`GITHUB_TOKEN`, který rotuje sám.

Release tedy vypadá takhle:

```bash
# 1. bump verze v package.json + commit
git push origin main
git tag -a v0.10.0 -m "0.10.0 — popis"
git push origin v0.10.0      # tag v* spusti .github/workflows/publish.yml
```

Workflow udělá typecheck + build, přeskočí publish, pokud verze v registry už je, a jinak
publikuje. Výsledek **neověříš lokálně přes `npm view`** — to potřebuje platný token; kontroluj
běh v Actions.

Konzumace balíčku v ostatních projektech je na tom stejně: dokud nemá stroj platný token
s `read:packages`, `npm install @smable/ui@<nova verze>` selže na 401.

## Konvence

- Po updatu balíčku v konzumentovi **zabij běžící Vite** — jinak servíruje starou verzi z cache
- Preset (`tailwind.preset.js`) je zdroj pravdy pro barvy i typografii; safelist hlídá třídy,
  které se generují dynamicky
- Před novou komponentou zkontroluj exporty — `KanbanBoard`, `SmableDrawer`, `DataTable`,
  `SearchBar`, `Badge`, `EmptyState`, `LoadingOverlay` už existují
