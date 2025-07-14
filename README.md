# DocTurbo Pilot

Mono-repo scaffold for DocTurbo pilot (Next.js frontend + Node/Express API).

## Packages

- `frontend` – React UI (Next.js 14, TypeScript, Tailwind)
- `services` – REST/GraphQL API (Express + Prisma)

## Getting Started

```
# Install dependencies (requires pnpm)
pnpm install

# Start all dev servers
pnpm dev
```

Environment variables expected in `packages/*/.env` or via CI secrets. See `.env.example` files in each package.
