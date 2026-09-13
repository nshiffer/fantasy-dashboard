# Fantasy Dashboard

A browser-only dashboard for Sleeper fantasy football leagues. Enter a Sleeper league ID to view standings, matchups, scoring trends, roster analysis, and draft tools.

## How data and privacy work

- The dashboard reads league data directly from the public Sleeper API in the visitor's browser.
- It does not request Sleeper account credentials, proxy league data through a server, or send analytics events.
- A league ID is saved only in that browser's local storage and can be removed with **Logout**.
- The full NFL player catalog loads only when a visitor opens Roster Analysis or Draft Board, keeping the initial dashboard responsive.

## Local development

Requires Node.js 22 or later.

```bash
npm ci
npm run check
npm run dev
```

`npm run check` is the complete local release check: it type-checks and creates the static export. Run it before pushing a deployable change. There are no browser checks or duplicate test suites in deployment.

## Deployment

GitHub Pages serves `https://fantasyfootball.shwrk.com/`.

- `.github/workflows/deploy.yml` builds and deploys only when deployable application files are pushed to `main`.
- The deployment performs `npm ci`, `npm run build`, and GitHub Pages artifact upload. It does not run browser checks.
- The old scheduled data workflow has been removed. The site never used its generated data, so removing it avoids recurring Actions minutes and accidental publication of league-specific files.
- GitHub Pages must use **Settings → Pages → Source: GitHub Actions**. The `CNAME` file keeps the custom domain attached to the Pages deployment.

## SEO

The static homepage includes an indexable explanation of the product, a canonical URL, Open Graph and Twitter metadata, `robots.txt`, and a one-page sitemap. League-specific data is loaded only after a visitor enters an ID, so it is not included in the crawlable document.

## Architecture

- Next.js static export
- React and Tailwind CSS
- Chart.js, loaded only with the dashboard visualizations
- Sleeper API
