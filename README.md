# cs-front — constantin.saguin.com

Headless frontend for my resume website [constantin.saguin.com](https://constantin.saguin.com), built with [Faust.js](https://faustjs.org/) (Next.js + headless WordPress).

## Scaffolding a fresh Faust frontend

This project was bootstrapped from the official FaustWP getting-started example:

```bash
npx create-next-app -e https://github.com/wpengine/faustjs/tree/main/examples/next/faustwp-getting-started cs-front-frontend
```

Then configure and run:

```bash
cd cs-front-frontend
cp .env.local.sample .env.local   # set NEXT_PUBLIC_WORDPRESS_URL + FAUST_SECRET_KEY
npm install
npm run dev                        # http://localhost:3000
```

### WordPress requirements

The connected WordPress install needs these plugins:

- **FaustWP**
- **WPGraphQL**

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | `faust build` — production build |
| `npm run start` | `faust start` — serve the production build |
| `npm run generate` | Regenerate `possibleTypes.json` from the WP GraphQL schema |
| `npm run lint` | Lint JS/TS |
| `npm run format` | Format with Prettier |
