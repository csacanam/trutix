# @trutix/backend

REST API for Trutix, a decentralized escrow protocol for peer-to-peer ticket trading using USDC.

---

## Tech Stack

- [Fastify](https://fastify.dev) - Web framework
- [Airtable](https://airtable.com) - Trade and user metadata storage
- [ethers.js](https://docs.ethers.org) - Blockchain interactions
- TypeScript

---

## Setup

### 1. Install dependencies

From the monorepo root:

```bash
npm run install:all
```

Or from this directory:

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3001) |
| `AIRTABLE_API_KEY` | Airtable personal access token |
| `AIRTABLE_BASE_ID` | Airtable base identifier |
| `ADMIN_WALLET` | Admin wallet address for dispute resolution |

### 3. Run

```bash
# From monorepo root
npm run dev:backend

# Or from this directory
npm run dev
```

Server starts at `http://localhost:3001`

---

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users` | Register a new user (address, name, email, phone) |
| `GET` | `/users/:address` | Check user existence by wallet address |

### Trades

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/trades` | Create a new trade |
| `GET` | `/trades/:tradeId` | Get trade details with buyer/seller info |
| `PATCH` | `/trades/:tradeId` | Update trade (status, timestamps, dispute) |
| `GET` | `/trades` | List trades with filters (status, wallet, pagination) |
| `GET` | `/wallet/:address/trades` | Get all trades for a wallet |
| `GET` | `/ping` | Health check |

### Trade Fields

```
tradeId, status, eventName, eventCity, eventCountry, eventDate, eventSection,
numberOfTickets, pricePerTicket, ticketPlatform, isTransferable,
buyer, seller, createdAt, paidAt, sentAt, confirmedAt, refundedAt,
disputedAt, disputeStatus, lastUpdatedBy, notes, paymentClaimed, paymentClaimedAt
```

### Trade Statuses

`Created` | `Paid` | `Sent` | `Confirmed` | `Disputed` | `Expired` | `Refunded`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with auto-reload |
| `npm start` | Production start |

---

## Automation

`scripts/expireCheck.ts` - Checks for trades past their 12-hour window and calls the smart contract's `expireTrade()` function. Requires `BASE_RPC_URL`, `PRIVATE_KEY`, and `TRADE_ESCROW_ADDRESS` in `.env`.

---

## Folder Structure

```
backend/
├── src/
│   ├── server.ts              # Fastify entrypoint
│   ├── lib/airtable.ts        # Airtable client
│   ├── routes/
│   │   ├── trades.ts          # Trade CRUD + wallet queries
│   │   └── users.ts           # User registration + verification
│   └── abis/TradeEscrow.json  # Smart contract ABI
├── scripts/
│   └── expireCheck.ts         # Trade expiration automation
├── .env.example
├── package.json
└── tsconfig.json
```
