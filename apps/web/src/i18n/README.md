# Web localization

The default language is Simplified Chinese (`zh-CN`); English is `en`.

- Page, component, notification and validation messages: `locales/zh-CN.json` and `locales/en.json` in this directory.
- Shared presentational messages: `packages/views/src/i18n/locales/zh-CN.json` and `en.json`.
- Shared translation runtime: `@safe-global/views/i18n`; app code imports `@/i18n` to register the web catalog.
- Dates: `@/i18n/date` and `@/config/locale`.
- Cookie policy: `src/markdown/cookie/cookie.md` (Chinese) and `cookie.en.md` (English).

Use `translateMessage('message.key', { p0: value })` for a resource containing `{{p0}}`. Values are inserted unchanged, including bigint amounts. English resources also support `{{p0_plural}}`, `{{p0_day}}`, and `{{p0_be}}` for the original count-sensitive copy.

English copy was aligned against `65535byte/safe-wallet-monorepo`, branch `dev`, pinned to commit `000aa482aac56c933b587072ad1e8632ae047cfe`. The source and regression tests were read as reference data; no reference-repository scripts were executed. Existing `8379` branding is retained. The two locally customized 8379 migration announcements remain unchanged in both languages, because they have no equivalent in that revision. Locally reorganized messages use the corresponding wording from the reference components.

The language selector saves `8379.language` in localStorage and reloads the current page. Reloading ensures that module-level menus, validators and feature constants all use the same language. Switching is disabled in the header while a transaction flow is open. Browser-only content mounts after hydration so a saved English preference cannot conflict with a Chinese static export. Storage failures keep the current language and display an error.

Do not translate protocol identifiers, analytics keys, addresses, transaction payloads, user-provided names, or API responses. The wallet connector keeps its existing separate Chinese catalog and uses its built-in English messages in English mode. Third-party iframe applications retain their own language controls.
