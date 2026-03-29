# Trutix

Decentralized P2P ticket trading platform powered by USDC on the Base network.

Trutix enables buyers and sellers to trade event tickets directly, without intermediaries. Payments are held in a smart contract escrow until both parties confirm the transaction, ensuring trustless and secure trades.

---

## Architecture

This monorepo contains three packages:

| Package | Description | Tech Stack |
|---------|-------------|------------|
| [`backend/`](backend/) | REST API for trade and user management | Fastify, Airtable, ethers.js, TypeScript |
| [`contracts/`](contracts/) | Smart contracts for escrow, disputes and fees | Solidity 0.8.20, Hardhat, OpenZeppelin |
| [`frontend/`](frontend/) | Web application for trading tickets | React 18, Vite, Tailwind CSS, Wagmi, Coinbase OnchainKit |

---

## How It Works

1. **Seller creates a trade** defining the event, tickets, and price.
2. **Buyer pays** with USDC (+5% fee). Funds are held in the smart contract escrow.
3. **Seller transfers the tickets** off-chain (e.g., via Ticketmaster) and marks the trade as "Sent".
4. **Buyer confirms reception**. Seller receives the payment minus a 5% fee.
5. If the buyer doesn't confirm within 12 hours, the trade auto-completes.
6. If the seller doesn't send within 12 hours, the buyer is auto-refunded.
7. Buyers can open a **dispute** if tickets aren't received. An admin resolves it on-chain.

### Trade Status Lifecycle

```
Created --> Paid --> Sent --> Completed
  |           |       |
  v           v       v
Expired   Refunded  Dispute --> Resolved (refund or payout)
```

---

## Prerequisites

- Node.js 18+
- npm 9+

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/csacanam/trutix.git
cd trutix
npm run install:all
```

### 2. Configure environment variables

Copy the example files and fill in your values:

```bash
cp backend/.env.example backend/.env
cp contracts/.env.example contracts/.env
cp frontend/.env.example frontend/.env
```

See each package's README for details on required variables.

### 3. Run locally

```bash
# Start the backend API (port 3001)
npm run dev:backend

# Start the frontend dev server (port 5173)
npm run dev:frontend
```

---

## Scripts

All scripts can be run from the project root:

| Command | Description |
|---------|-------------|
| `npm run dev:backend` | Start backend in development mode |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run start:backend` | Start backend in production mode |
| `npm run build:frontend` | Build frontend for production |
| `npm run compile:contracts` | Compile smart contracts |
| `npm run test:contracts` | Run smart contract tests |
| `npm run install:all` | Install dependencies for all packages |

---

## Smart Contracts

Deployed on **Base** (Coinbase L2):

| Contract | Network | Address |
|----------|---------|---------|
| TradeEscrow | Base Mainnet | `0x30B454b381B4dbac865d9B0Be00c211a29a087C1` |
| TradeEscrow | Base Sepolia | `0xA8e38e6Ea909Efd8852A027CBe126a0ac3dc4983` |
| MockUSDC | Base Sepolia | `0xC8310baA6444e135f7BC54D698F0EE32Fa0621a3` |

### Fees

- Buyer fee: 5% (configurable)
- Seller fee: 5% (configurable)
- Collected fees are withdrawable by the contract owner

### Security

- ReentrancyGuard (OpenZeppelin)
- Time-gated permissionless expiration
- Dispute freeze mechanism

---

## API Endpoints

Base URL: `http://localhost:3001`

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Register a new user |
| GET | `/users/:address` | Check if user exists |

### Trades

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trades` | Create a new trade |
| GET | `/trades/:tradeId` | Get trade details |
| PATCH | `/trades/:tradeId` | Update trade status |
| GET | `/trades` | List trades (filterable by status, wallet) |
| GET | `/wallet/:address/trades` | Get all trades for a wallet |
| GET | `/ping` | Health check |

---

## Project Structure

```
trutix/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Fastify entrypoint
│   │   ├── lib/airtable.ts        # Airtable client
│   │   ├── routes/trades.ts       # Trade endpoints
│   │   ├── routes/users.ts        # User endpoints
│   │   └── abis/TradeEscrow.json  # Contract ABI
│   ├── scripts/expireCheck.ts     # Trade expiration automation
│   ├── package.json
│   └── tsconfig.json
├── contracts/
│   ├── contracts/
│   │   ├── TradeEscrow.sol        # Main escrow contract
│   │   └── MockUSDC.sol           # Test USDC token
│   ├── scripts/
│   │   ├── deploy.ts              # Deployment script
│   │   └── testnet/               # Testnet interaction scripts
│   ├── test/TradeEscrow.test.js   # Contract test suite (8 tests)
│   ├── hardhat.config.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Home, Dashboard, CreateTrade, TradeDetail, FAQ
│   │   ├── components/            # Modals, Layout, Footer
│   │   ├── constants/             # ABI, country codes
│   │   ├── App.tsx                # Router setup
│   │   ├── providers.tsx          # Wagmi + OnchainKit providers
│   │   └── wagmi.ts               # Wallet configuration
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── package.json                   # Root scripts
├── .gitignore
└── README.md
```

---

## Author

Camilo Saka - [@camilosaka](https://twitter.com/camilosaka)

---

## License

MIT
