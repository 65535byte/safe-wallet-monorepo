# H5 transfer migration

Source: `drixone_8379_h5/src/pages/transfer/index.vue`.

Routes: `/transfer`, `/pages/transfer`, `/pages/transfer/index` (trailing slash supported).
Parameters: `appName`, `appIcon`, `openUrl`, parsed once with URLSearchParams.

The original guide images and rpx layout are retained (responsive viewport capped at 750px). Regular browser mode shows the Add to Home Screen guide. iOS `navigator.standalone` shows the entry screen and attempts the supplied app URL once on mount; the button retries. WeChat does not launch external apps. Browser policies may block automatic custom scheme launches; real iOS verification is still needed.

The source's default `/static/app_icon.png` is missing from its repository, so the supplied default here is the source's `src/static/common/logo.png`. An explicit `appIcon` overrides it. No App Store timeout fallback is added: the source defines a timeout and store URL but never uses them. Unsafe script/data/file/blob URLs are rejected; custom app schemes are preserved.
