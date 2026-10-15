# Wayfold

A micro-community for people in Toronto and the GTA who buy, sell and look after cars.

Wayfold is a responsive web application. Members share the cars they own, list private sales, and recommend the dealers, mechanics and products they trust. Auto industry providers have profiles, dealers list their inventory, and verified financing professionals answer members' questions about whether a price or financing offer is a good deal. Wayfold is built for Christians: members can show their home church as a trust signal. Anyone in the GTA can join.

> **Status:** Early development. Accounts and the app shell are in progress. See [docs/estimates](docs/estimates) for progress by subsystem.

## Contents

- [Features](#features)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Testing](#testing)
- [Project structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Features

- **Member profiles and garages:** share the cars you own.
- **Marketplace:** private sales and dealer inventory with detailed vehicle pages and search.
- **Provider directory:** dealers, mechanics, body shops, tire shops, detailers, towing, insurance, parts and financing.
- **Recommendations:** recommend the providers and products you use.
- **Deal guidance:** a price rating on every vehicle and public questions answered by verified financing professionals.
- **Accessibility:** designed to meet WCAG 2.2 AA.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or later
- [Docker](https://www.docker.com/) for the local PostgreSQL database

### Installation

```bash
git clone https://github.com/QuinntyneBrown/wayfold.git
cd wayfold
npm install
cp .env.example .env.local
docker compose up -d
npm run db:migrate
```

The database runs on `localhost:5434`. Set `DATABASE_URL` in `.env.local` if you change it.

## Usage

```bash
npm run dev
```

Open <http://localhost:3000>.

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm run lint` | Lint the code |
| `npm run typecheck` | Type-check the code |
| `npm run db:generate` | Generate a database migration |
| `npm run db:migrate` | Apply database migrations |

## Testing

```bash
npm test            # unit tests (Vitest)
npm run test:e2e    # acceptance tests (Playwright, Chromium)
```

Acceptance tests fake every API response, so they do not need the backend running.

## Project structure

```
docs/          requirements, designs, mocks, design system and estimates
public/        static assets
src/app/       routes and API route handlers (Next.js App Router)
src/features/  feature logic, forms and dialogs
src/lib/       shared helpers
tests/         Playwright specs and page objects
tools/         video and diagram tooling
```

## Documentation

- [Requirements](docs/specs)
- [Detailed designs](docs/detailed-designs)
- [HTML mocks](docs/mocks)
- [Design system](docs/design-system)
- [Estimates](docs/estimates)

## Contributing

Contributions are welcome. Read the [contributing guide](CONTRIBUTING.md) and the [code of conduct](CODE_OF_CONDUCT.md) before you open an issue or pull request.

## Security

To report a vulnerability, follow the [security policy](SECURITY.md). Do not open a public issue.

## License

Licensed under the [MIT License](LICENSE).
