# UK Realty

UK Realty is a full-stack real-estate platform built with Next.js (App Router), Prisma, and NextAuth.

## Tech Stack

- Next.js 16
- React 19
- Prisma ORM
- PostgreSQL
- NextAuth (credentials auth)
- Tailwind CSS
- Vitest + Testing Library

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create an env file:

```bash
cp .env.example .env
```

3. Run Prisma client generation and migrations as needed:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start development server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - generate Prisma client and build production app
- `npm run start` - start production server
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode
- `npm run test:coverage` - run tests with coverage

## Required Environment Variables

See `.env.example` for the full list.

## Security Notes

- Never commit `.env`.
- Configure `ADMIN_SESSION_SECRET` in production.
- Set real API credentials for Twilio, Resend, and Cloudinary before enabling those features.

## License

MIT. See `LICENSE`.
