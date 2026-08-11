/**
 * A test-only `AUTH_SECRET`, so the token HMAC has a pepper without a test
 * reaching for the real one. It is set here rather than in each file because
 * `env()` caches its parse on first read — a variable set halfway through a run
 * would be ignored, which is a confusing way to learn how the cache works.
 *
 * This is not a secret. It never leaves this process and no deployment reads it.
 */
process.env.AUTH_SECRET ??= "test-secret-not-used-by-any-deployment";
