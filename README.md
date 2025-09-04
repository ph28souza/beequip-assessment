# Beequip — Playwright Assessment

## How to run
```bash
npm install
npm run pw:install
npm test
npm run test:ui
npm run report

Approach & design decisions

I implemented Playwright E2E tests for the required user journey exclusively on Beequip’s staging site using Basic Auth (httpCredentials).
To avoid header overlap, tests navigate directly to the Marketplace, then use resilient locators (role/name text with safe fallbacks) to filter and open a matching listing.
The suite runs on Chromium and WebKit and produces an HTML report.
Tests are non-destructive (no production, no real emails).
The lease calculator is a stretch goal that depends on a third-party widget; the test is best-effort and skips when the widget is not available to keep the suite stable and within the timebox.