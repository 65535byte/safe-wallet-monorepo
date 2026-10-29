# WebView select regression fixture

Run `npm run dev`, then open `/tests/select-compat/index.html` in the target browser/WebView.

This fixture contains no wallet provider, API calls, signing, or transaction submission.

1. Open the transfer test and expand Asset. The parent counter updates every second; the menu should remain open without flashing.
2. Choose USDT, then choose Unsigned under Signing. Verify form values, close the dialog, and check that the result is `{"token":"erc20","proposal-signing":"unsigned"}`.
3. Reopen a menu and click outside it. Only the menu should close. Escape should close the menu first without closing its containing dialog.
4. Verify ArrowUp/ArrowDown, Home/End, Enter/Space and Tab keyboard behavior.
5. Verify the real creation/import network selectors using the configured three networks. No deployment or wallet signature is required.

The production build only includes the main app entry; this fixture is for local validation.
