# @trutix/contracts

Smart contract infrastructure for secure, trustless P2P ticket trades using USDC on the Base network.

---

## Overview

The `TradeEscrow` contract handles the full lifecycle of a P2P ticket trade: escrow, time-based expiration, dispute resolution, and fee distribution.

### Trade Flow

```
1. Seller creates trade (defines price)
2. Buyer pays USDC + fee --> funds held in escrow
3. Seller transfers tickets off-chain, marks as "Sent"
4. Buyer confirms reception --> seller gets paid
5. Auto-complete after 12h if buyer doesn't respond
6. Auto-refund after 12h if seller doesn't send
7. Buyer can dispute --> admin resolves on-chain
```

### Status Lifecycle

```
Created --> Paid --> Sent --> Completed
  |           |       |
  v           v       v
Expired   Refunded  Dispute --> Resolved
```

---

## Contracts

| Contract | Description |
|----------|-------------|
| `TradeEscrow.sol` | Main escrow contract with dispute resolution |
| `MockUSDC.sol` | ERC20 test token (6 decimals, permissionless mint) |

### Key Parameters

| Parameter | Value |
|-----------|-------|
| Solidity version | 0.8.20 |
| USDC decimals | 6 |
| Default seller fee | 5% (500 basis points) |
| Default buyer fee | 5% (500 basis points) |
| Expiration window | 12 hours |

### Security

- `ReentrancyGuard` from OpenZeppelin
- Time-gated permissionless expiration
- Dispute freeze mechanism
- Zero-address validation

---

## Deployed Addresses

| Contract | Network | Address |
|----------|---------|---------|
| TradeEscrow | Base Mainnet | `0x30B454b381B4dbac865d9B0Be00c211a29a087C1` |
| TradeEscrow | Base Sepolia | `0xA8e38e6Ea909Efd8852A027CBe126a0ac3dc4983` |
| MockUSDC | Base Sepolia | `0xC8310baA6444e135f7BC54D698F0EE32Fa0621a3` |

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
| `PRIVATE_KEY` | Deployer wallet private key |
| `BASE_RPC_URL` | Base Sepolia RPC endpoint |
| `BASE_MAINNET_RPC_URL` | Base Mainnet RPC endpoint |
| `PRIVATE_KEY_SELLER` | Seller test account (testnet only) |
| `PRIVATE_KEY_BUYER` | Buyer test account (testnet only) |
| `TRADE_ESCROW_ADDRESS` | Deployed TradeEscrow address |
| `USDC_ADDRESS` | USDC/MockUSDC token address |

### 3. Compile

```bash
# From monorepo root
npm run compile:contracts

# Or from this directory
npx hardhat compile
```

### 4. Test

```bash
# From monorepo root
npm run test:contracts

# Or from this directory
npx hardhat test
```

8 tests covering: full trade flow, dispute resolution (buyer/seller), expiration scenarios, auto-complete, auto-refund, and fee withdrawal.

---

## Deployment

```bash
# Base Sepolia (deploys MockUSDC + TradeEscrow)
npx hardhat run scripts/deploy.ts --network baseSepolia

# Base Mainnet (uses real USDC at 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
npx hardhat run scripts/deploy.ts --network base
```

---

## Testnet Scripts

Located in `scripts/testnet/`. Run with:

```bash
npx tsx scripts/testnet/<script>.ts
```

| Script | Actor | Description |
|--------|-------|-------------|
| `createTrade.ts` | Seller | Create a 100 USDC trade |
| `markAsSent.ts` | Seller | Mark tickets as sent |
| `payTrade.ts` | Buyer | Pay for a trade |
| `confirmReception.ts` | Buyer | Confirm ticket reception |
| `expireTrade.ts` | Anyone | Trigger expiration |
| `withdrawFees.ts` | Admin | Withdraw platform fees |
| `statusCheck.ts` | Info | Display trade details |
| `checkBalances.ts` | Info | Show USDC balances |
| `checkDecimals.ts` | Info | Verify token config |

---

## Folder Structure

```
contracts/
├── contracts/
│   ├── TradeEscrow.sol        # Main escrow contract
│   └── MockUSDC.sol           # Test USDC token
├── scripts/
│   ├── deploy.ts              # Deployment script
│   └── testnet/               # 9 testnet interaction scripts
├── test/
│   └── TradeEscrow.test.js    # Full test suite (8 tests)
├── abi/
│   └── TradeEscrow.json       # Exported ABI
├── hardhat.config.ts
├── .env.example
├── package.json
└── tsconfig.json
```
