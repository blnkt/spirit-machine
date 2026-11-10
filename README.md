# Spirit Machine

Website for **Spirit Machine**, a community choir in Portland, Oregon.

Live site: [spiritmachine.org](https://spiritmachine.org)

## Stack

| Piece | Role |
|--------|------|
| [Eleventy 3](https://www.11ty.dev/) | Static site generator (Markdown + Nunjucks → HTML) |
| [Decap CMS](https://www.decapcms.org/) | Browser editing UI at `/admin/` |
| [Netlify](https://www.netlify.com/) | Build, host, Identity + Git Gateway for CMS auth |
| GitHub | Source of truth (`main` branch) |

Content lives in the repo as Markdown and JSON. There is **no GitHub Actions build** — Netlify builds on push.

## Requirements

- Node.js **18+**

## Local development

```bash
git clone https://github.com/blnkt/spirit-machine.git
cd spirit-machine
npm install
npm run serve
```

Then open [http://localhost:8080/](http://localhost:8080/).

### npm scripts

| Script | What it does |
|--------|----------------|
| `npm run serve` | Build + local server with live reload (port 8080) |
| `npm run build` | Production build into `_site/` |
| `npm run watch` | Rebuild on file changes (no server) |
| `npm run a11y` | Build, serve `_site` briefly, run pa11y-ci (WCAG 2.2 AA) |
| `npm run debug` | Eleventy with `DEBUG=*` |

Site-wide settings live in `_data/site.json` and `_data/metadata.json` (title, description, canonical URL).

## Project layout (high level)

```
pages/           # Home, Calendar, Videos, About
events/          # Calendar event Markdown
_data/           # site.json, metadata.json, videos.json
_includes/       # Layouts, components, inline CSS/JS
admin/           # Decap CMS config + Identity email templates
static/img/      # Images / media for the CMS
netlify.toml     # Build command + publish directory
```

## Content editing (Decap CMS)

### Production (`/admin/`)

1. Netlify **Identity** and **Git Gateway** must be enabled for the site.
2. Invite editors under Identity → Users (or use an Identity external provider such as GitHub).
3. Point Identity email templates at the files under `admin/email-templates/` (e.g. `/admin/email-templates/invitation.html`).
4. Open `https://spiritmachine.org/admin/` (or your Netlify URL), sign in, and edit.

Backend is `git-gateway` on the `main` branch (`admin/config.yml`). Saves commit to the repo and trigger a Netlify deploy.

**Private repo note:** If the GitHub repo is private, regenerate the Git Gateway GitHub access token in Netlify → Identity → Services → Git Gateway.

### Local CMS (optional)

1. Uncomment `local_backend: true` in `admin/config.yml`.
2. In one terminal: `npx decap-server`
3. In another: `npm run serve`
4. Open `/admin/` — edits write to the local filesystem (no Netlify login).

Remember to comment `local_backend` out again before relying on production Identity auth.

## Deployment

Configured in `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `_site`

Netlify is connected to this GitHub repo. Pushes to `main` (and CMS commits via Git Gateway) kick off a deploy. Preview deploys may also run for pull requests if enabled on the Netlify site.

## Accessibility

```bash
npm run a11y
```

Runs [pa11y-ci](https://github.com/pa11y/pa11y-ci) against key pages (axe + HTML CodeSniffer, WCAG 2.2 AA). The script starts a temporary static server on port **8099**, so it does not require `npm run serve` already running.

## Origin

Originally based on [eleventy-netlify-boilerplate](https://github.com/danurbanowicz/eleventy-netlify-boilerplate); adapted for Spirit Machine.
