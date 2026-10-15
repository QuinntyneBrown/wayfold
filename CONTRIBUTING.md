# Contributing to Wayfold

Thank you for your interest in contributing. This guide explains how to propose changes.

By participating, you agree to follow the [code of conduct](CODE_OF_CONDUCT.md).

## Reporting issues

- Search [existing issues](https://github.com/QuinntyneBrown/wayfold/issues) first.
- Include steps to reproduce, what you expected and what happened.
- Report security issues through the [security policy](SECURITY.md), not in public issues.

## Development process

Every change to production behaviour follows this order:

1. A requirement in [docs/specs](docs/specs).
2. A detailed design in [docs/detailed-designs](docs/detailed-designs).
3. A mock in [docs/mocks](docs/mocks).
4. Implementation in small slices with acceptance test-driven development: write the
   Given-When-Then criteria and a failing acceptance test before the production code.

See [AGENTS.md](AGENTS.md) for the full engineering rules.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep the change small and focused on one thing.
3. Run the checks before you push:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run test:e2e
   ```

4. Write commit messages in the imperative mood, for example "Add sign out".
5. Open a pull request that describes the change and links the related issue.

## Coding guidelines

- Keep solutions simple and limited to the request.
- Meet WCAG 2.2 AA.
- Playwright tests use the Page Object Model; never put a selector in a test.
- Frontend tests fake every API response and run in Chromium only.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
