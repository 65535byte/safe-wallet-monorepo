# H5 Markdown migration

Source: `/Users/lzz/vscode/drixone_8379_h5`.

- `src/pages/quick.vue` loads `src/doc/quick_app.md?raw`. The Web equivalent is `/quick`, with the original `/pages/quick` route also supported.
- `src/guide.vue` loads `src/doc/guide.md?raw`. The Web equivalent is `/guide`.
- Both Markdown files are copied unchanged into `content/` and bundled using Vite raw imports. They are Chinese source documents; they have not been rewritten or translated.
- The four original `src/static/quick/*.png` screenshots are copied to `public/images/quick/`. The renderer maps only those original image URLs to their local equivalents.
- Markdown uses React text nodes, not injected HTML. Code examples are displayed only; they never connect wallets, sign or send transactions.
- Pages follow the original white background and Markdown typography, with no wallet header, back button or footer navigation.
