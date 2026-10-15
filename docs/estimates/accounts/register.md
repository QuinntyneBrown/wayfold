# Estimate — Register

## Basis

Estimate for an intermediate Next.js/React developer who does not know this codebase. The hours assume the Next.js project exists and that the database and auth library choices (`<TO SUPPLY>`) are made before work starts. They cover implementation, tests, and review fixes. See the [Detailed design](../../detailed-designs/accounts/register/README.md).

## Full design

| Work item | Hours |
|-----------|------:|
| `RegisterPage` form with field-level and form errors, keyboard and WCAG 2.2 AA behaviour | 6 |
| `RegisterRoute` handler with email and password validation | 3 |
| `RegistrationService` with duplicate check and non-revealing error | 4 |
| `PasswordHasher` module | 2 |
| `User` and `Session` schema and migration | 4 |
| Session cookie issuance | 3 |
| Playwright acceptance tests with page object and route interception | 5 |
| **Total** | **27** |

## Minimal scope

The minimal version delivers the registration form, the route, the service, and the schema, with sign-in on success. It leaves out the Playwright suite beyond the happy path and the polish of accessible error messaging. It satisfies `L2-001` criteria 1 and 3 and defers the full non-revealing duplicate-email handling in criterion 2. Total: 19 hours.

## Partial descoping

| Descope | What is lost | Hours saved |
|---------|--------------|------------:|
| Playwright tests for the duplicate-email and invalid-input paths | Less regression coverage | 3 |
| Separate `PasswordHasher` module; call the library inline | Slightly harder to swap the algorithm | 1 |
| Automatic sign-in after registration; redirect to sign-in | Criterion 1 is only partly met | 3 |
