# ContribMint 🌿💎

**ContribMint** is a Web3-enabled platform that gamifies open-source contributions. It allows projects to issue NFTs to contributors based on the quality and impact of their work, determined by a decentralized community consensus mechanism.

## Features

- **Role-Based Insights**: Dashboards for Contributors, Maintainers, and Sponsors.
- **GitHub Integration**: Automatically syncs Pull Requests and Issues.
- **Consensus Engine**: Community voting system (1-5 stars) to rate the impact of contributions.
- **Lazy Minting**: Approved contributions can be minted as NFTs by the contributor. The platform signs the voucher, and the user pays the gas.
- **Tech Stack**: Next.js 14, Tailwind CSS, Prisma (SQLite), Hardhat, Wagmi, RainbowKit.

## Prerequisites

- **Node.js** v18+
- **pnpm** (recommended) or npm
- **MetaMask** (or any Web3 wallet) equipped with a Localhost network.

## Getting Started

### 1. Installation

Clone the repository and install dependencies for both the frontend and smart contracts.

```bash
git clone https://github.com/your-username/contribmint.git
cd contribmint

# Install root dependencies (Next.js)
pnpm install

# Install Smart Contract dependencies
cd smart-contracts
npm install
cd ..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database (SQLite for Dev)
DATABASE_URL="file:./dev.db"

# NextAuth & GitHub
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Web3 / WalletConnect
NEXT_PUBLIC_WALLETCONNECT_ID="your-walletconnect-project-id"

# Admin Private Key (for signing NFT vouchers)
# This should match Account #0 in your Hardhat node
ADMIN_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" 
```

### 3. Smart Contract Setup (Local Blockchain)

Open a new terminal to run the local blockchain node:

```bash
cd smart-contracts
npx hardhat node
```

In a **separate terminal**, deploy the `ContribNFT` contract to the local network:

```bash
cd smart-contracts
npx hardhat run scripts/deploy.ts --network localhost
```

> **Note**: Copy the deployed contract address and update `const CONTRACT_ADDRESS` in `components/minting/claim-button.tsx` if it differs from the default.

### 4. Database Setup

Initialize the SQLite database and Prisma client:

```bash
# Generate Prisma Client (Updated for Web3 fields)
npx prisma generate

# Push schema to DB
npx prisma db push
```

### 5. Run the Application

Start the Next.js development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## How it Works

1.  **Login**: Sign in with your GitHub account.
2.  **Import**: Import a repository to track.
3.  **Contribute**: Open a PR in the real GitHub repo. ContribMint syncs this activity.
4.  **Vote**: Maintainers rate the contribution in the **Dashboard**.
5.  **Consensus**: Once the score threshold is met (e.g., avg > 3 stars), the status becomes `READY_TO_MINT`.
6.  **Claim**: The contributor connects their wallet and mints their **ContribNFT**.

## Architecture

- **Frontend**: `app/` (Next.js App Router)
- **Backend API**: `app/api/` (NextResponse handlers)
- **Database**: `prisma/schema.prisma` (SQLite)
- **Smart Contracts**: `smart-contracts/contracts/ContribNFT.sol` (ERC-721 + EIP-712)
