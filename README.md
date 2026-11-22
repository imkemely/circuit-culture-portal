# Circuit Culture Online Portal – Prototype

Prototype for CEN4021 Deliverable 5. It covers one full shopper journey: browse products → view a product → add to cart → checkout (mock payment) → order confirmation.

Backend is Spring Boot (Java 17) with an H2 in-memory database. Frontend is React + Vite.

## Team

| Name | Part |
|---|---|
| Kemely Alfonso Martinez | Repo setup, orders API, confirmation page, merging |
| Arnold Miranda-Pino | Product API, seed data, product list + product page |
| Luis Abbud | Cart page, checkout form, mock payment |
| Shreya Sureshbabu Banumathi | Header/footer/layout/styling, stock check on order |

## What you need installed

- **Java 17** (JDK). Check with `java -version`.
- **Node 20.19 or newer**. Check with `node -v`. If yours is older, update it. If you use nvm, run `nvm install lts` and then `nvm use <version it printed>`.
- Git

## How to run it

You need two terminals, one for each half.

**Backend** (runs on http://localhost:8080)
```
cd backend
.\mvnw.cmd spring-boot:run      # Windows
./mvnw spring-boot:run          # Mac
```
The first run takes a few minutes because it downloads dependencies. It's ready when you see `Started PortalApplication`.

**Frontend** (runs on http://localhost:5173)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173 in your browser. Any request to `/api/...` is forwarded to the backend automatically (see `vite.config.js`).

If you get a "JAVA_HOME is not defined" error, Java isn't installed or JAVA_HOME isn't set. Ask in the group chat.

## API endpoints

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | One product with its sizes, colors and stock |
| POST | `/api/orders` | Place an order: checks stock and payment, returns an order number |
| GET | `/api/orders/{orderNumber}` | Get an order by its number (used by the confirmation page) |

Payment is mocked. Card `4242 4242 4242 4242` is approved and any other card number is declined.

## How we work in this repo

1. Never push straight to `main`.
2. Make a branch for your part:
   ```
   git checkout main
   git pull
   git checkout -b feature/<your-part>
   ```
   For example `feature/catalog`, `feature/cart-checkout`, `feature/layout`, `feature/orders`.
3. Commit small and often, with clear messages.
4. Push your branch and open a pull request on GitHub.
5. Someone else reviews and merges it. Don't merge your own PR.
6. Before starting new work, run `git checkout main` and `git pull` so you have everyone's changes.