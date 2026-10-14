# StudyFly ? development and deployment

`website/` is the complete live site. Upload its **contents** to DirectAdmin `public_html`; do not upload the repository root or a containing `website` directory.

## Project map

- `website/`: production HTML, shared CSS/JavaScript, images, final brand exports, manifest, crawl files and DirectAdmin configuration.
- `docs/`: audit/design history, deployment guide and restructuring report.
- `tools/`: current local preview, verification, packaging and brand helpers. `archive/` holds historical one-off scripts; `vendor/` is development-only.
- `output/`: QA, screenshots, Lighthouse history, comparisons, snapshots and local ZIP packages.
- `source-assets/`: approved SVG masters, original/reference brand material, font/license sources, hero sources and editable campaign-image masters.

The current production source is **website/index.html**, not a second index.html in the repository root.

## Preview and verification

```powershell
node tools/preview.cjs
node tools/deployment-check.cjs
node tools/preview-check.cjs
python tools/html-structure.py
```

Preview: http://127.0.0.1:4173/ ? EN `/`, AR `/ar/`, RU `/ru/`. Retired residence URLs redirect to `/` (301).

Preview strips Google/Clarity vendor loaders from HTTP responses only; production HTML is unchanged. Regression tools intercept external requests and never send a real WhatsApp message or conversion.

For another development machine, install the development dependencies with `npm install --prefix tools` and provide Google Chrome. The existing local Codex runtime is retained as a fallback. These dependencies are never deployed.

## Package

```powershell
python tools/pack-production.py
```

The ZIP is `output/deploy/studyfly-website.zip`. It has `index.html` and `.htaccess` at the archive root. You can also ZIP the contents of `website/` manually.

## Brand sources

The final, approved vectors are in `source-assets/brand/approved/`. Their production copies live in `website/assets/brand/logos/`. `node tools/sync-brand.cjs` copies these exact masters and renders Apple/PWA PNG derivatives without regenerating the logo design.

`python tools/replace-embedded-logo.py` is a targeted campaign-logo replacement using the protected original images and the SVG stamp from the sync helper. The resulting editable PNG masters remain outside production.

Historical logo generators and one-off apply scripts are archived and are not the current build workflow. Do not use them to overwrite the approved SVGs.

Read [the deployment guide](docs/DEPLOYMENT.md) and [the restructuring report](docs/RESTRUCTURE-REPORT.md). Earlier reports under `docs/` retain historical paths where appropriate.
