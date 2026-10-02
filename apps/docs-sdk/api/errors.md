# Errors

Every failure is a `MediaError` with a `code` and, for HTTP failures, a `status`.

| Code | Cause |
|---|---|
| `AUTH` | Missing or blank key, or HTTP 401/403 |
| `NOT_FOUND` | HTTP 404 |
| `RATE_LIMIT` | HTTP 429 |
| `BAD_REQUEST` | Other HTTP 4xx, or an empty search query |
| `NETWORK` | The request could not be made (offline, DNS, CORS) |
| `UNKNOWN` | HTTP 5xx, missing `fetch`, or any unclassified error |

```ts
try {
  await client.search({ query: "cats" });
} catch (e) {
  if (e instanceof MediaError && e.code === "RATE_LIMIT") showMessage("Please wait a minute.");
}
```

In React, `useMediaSearch` returns `error` and `retry`. If a later page fails, `items` keep what was loaded and `error` is set, so you can show a "couldn't load more" notice.
