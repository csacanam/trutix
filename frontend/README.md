# @trutix/frontend

Web application for Trutix, a decentralized P2P ticket trading platform on the Base network.

---

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Wagmi** + **Viem** - Wallet and blockchain interactions
- **Coinbase OnchainKit** - Wallet connection (Smart Wallet)
- **React Router** v6 - Routing
- **TanStack React Query** - Server state
- **Axios** - HTTP client
- **Lucide React** - Icons

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
| `VITE_PUBLIC_ONCHAINKIT_API_KEY` | Coinbase OnchainKit API key |
| `VITE_TRUTIX_CONTRACT_ADDRESS` | TradeEscrow contract address |
| `VITE_USDC_ADDRESS` | USDC token address |
| `VITE_BACKEND_URL` | Backend API URL (default: `http://localhost:3001`) |
| `VITE_USE_TESTNET` | `true` for Base Sepolia, `false` for Base Mainnet |

### 3. Run

```bash
# From monorepo root
npm run dev:frontend

# Or from this directory
npm run dev
```

Opens at `http://localhost:5173`

---

## Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page with feature overview |
| `/dashboard` | Dashboard | Wallet balance, trades, deposit/withdraw |
| `/create-trade` | CreateTrade | Multi-step form to list tickets |
| `/trade/:id` | TradeDetailReal | Trade detail with status tracking |
| `/faq` | FAQ | Frequently asked questions |

---

## Key Features

- **Coinbase Smart Wallet** connection
- **USDC management** - Deposit (QR code) and withdraw
- **Trade creation** - Multi-step form with event details, pricing, buyer info
- **Trade lifecycle** - Status tracking from creation to completion
- **Payment flow** - USDC approval + smart contract payment
- **Dispute handling** - Buyer can dispute, UI shows resolution
- **User profiles** - Name, email, phone, country

---

## Build

```bash
# From monorepo root
npm run build:frontend

# Or from this directory
npm run build
```

Output goes to `dist/`. Configured for SPA deployment (includes `public/_redirects` for Netlify).

---

## Folder Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # Landing page
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── CreateTrade.tsx       # Trade creation form
│   │   ├── TradeDetailReal.tsx   # Trade detail view
│   │   └── FAQ.tsx               # FAQ page
│   ├── components/
│   │   ├── Layout.tsx            # Nav bar + wallet connection
│   │   ├── Footer.tsx            # Footer with social links
│   │   ├── PaymentModal.tsx      # USDC payment flow
│   │   ├── DepositModal.tsx      # Deposit with QR code
│   │   ├── WithdrawModal.tsx     # USDC withdrawal
│   │   ├── ProfileModal.tsx      # User profile form
│   │   ├── LoginModal.tsx        # Wallet connect prompt
│   │   ├── SuccessModal.tsx      # Success notification
│   │   ├── ErrorModal.tsx        # Error notification
│   │   └── InsufficientBalanceModal.tsx
│   ├── constants/
│   │   ├── trutixAbi.ts          # Smart contract ABI
│   │   └── countryCodes.ts       # Country dial codes
│   ├── App.tsx                   # Router setup
│   ├── providers.tsx             # Wagmi + OnchainKit providers
│   ├── wagmi.ts                  # Wallet configuration
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind imports
├── public/
│   ├── favicon.png
│   └── _redirects                # SPA redirect config
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── .env.example
├── package.json
└── tsconfig.json
```
