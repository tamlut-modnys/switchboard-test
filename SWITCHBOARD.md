# Switchboard BTC Price Feed Example

This project demonstrates how to create and use a Switchboard price feed on Solana devnet.

## What We Built

### 1. Feed Deployment (`index.ts`)
Creates a BTC/USDT price feed on Solana devnet that:
- Fetches data from Binance API
- Parses the JSON response
- Stores the job definition on IPFS via Crossbar
- Deploys the feed to Solana devnet

### 2. Feed Reader (`read-feed.ts`)
Reads data from the deployed feed including:
- Current BTC price (once oracles update it)
- Feed configuration (variance, staleness, etc.)
- Feed metadata

### 3. Solana Program (`programs/btc-reader/`)
A simple Anchor program that demonstrates how to:
- Read price data from a Switchboard feed in a Solana program
- Store the price data on-chain
- Access feed metadata

## Setup

### Prerequisites
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Bun (already done if using this project)
```

### Create a Devnet Wallet
```bash
# Generate a keypair
solana-keygen new --outfile ~/.config/solana/id.json

# Get devnet SOL (free testnet tokens)
solana airdrop 2 --url devnet
```

### Install Dependencies
```bash
bun install
```

## Usage

### Deploy a New Feed
```bash
bun index.ts
```

This will:
1. Simulate the oracle jobs
2. Store jobs on Crossbar/IPFS
3. Create the feed account on devnet
4. Print the feed address and transaction signature

Example output:
```
Feed initialized successfully!
Feed Address: ALtJ2EE5AaLorWh8bxbzq1M5c32GifyVZHh3gakGhGYh
Transaction Signature: 4zrspm1g...
```

### Read From the Feed
```bash
bun read-feed.ts
```

This displays:
- Feed configuration
- Current BTC price (if available)
- Feed metadata
- Data age and staleness

Example output:
```
=== Feed Information ===
Feed Address: ALtJ2EE5AaLorWh8bxbzq1M5c32GifyVZHh3gakGhGYh
Feed Name: BTC Price Feed

=== Configuration ===
Queue: EYiAmGSdsQTuCw413V5BzaruWuCCSDgTPtBGvLkXHbe7
Max Variance: 1000000000
Min Responses: 1
Max Staleness: 300 slots

=== Current Value ===
BTC Price: $106564.24
Last Update Slot: 419116210
```

## Understanding the Components

### Crossbar
- Off-chain infrastructure service
- Stores oracle job definitions on IPFS
- Provides APIs for feed updates
- Default URL: `https://crossbar.switchboard.xyz`

### Oracle Queue
- Collection of oracle nodes
- Processes feed update requests
- Each feed is bound to a specific queue
- On devnet: `EYiAmGSdsQTuCw413V5BzaruWuCCSDgTPtBGvLkXHbe7`

### Pull Feed
- On-chain account that stores feed configuration
- Contains the IPFS hash of job definitions
- Stores the latest oracle responses
- Can be read by any Solana program

### Feed Configuration

```typescript
{
  maxVariance: 1.0,        // Max 1% difference between oracle responses
  minResponses: 1,         // Require at least 1 oracle response
  minSampleSize: 1,        // Minimum samples to update
  maxStaleness: 300,       // Data expires after 300 slots (~2 minutes)
}
```

## Building the Solana Program

The Anchor program in `programs/btc-reader/` shows how to read feed data in a Solana smart contract:

```rust
pub fn read_btc_price(ctx: Context<ReadBtcPrice>) -> Result<()> {
    let feed_account = &ctx.accounts.feed;
    let feed = PullFeedAccountData::parse(feed_account.data.borrow()).unwrap();

    let value = feed.value();
    msg!("Current BTC Price: ${}", value);

    Ok(())
}
```

**Note:** Building the program requires compatible Rust versions. The client scripts (`index.ts` and `read-feed.ts`) work out of the box.

## Feed Updates

Newly created feeds don't have values until oracles update them. This happens when:
1. Someone requests an update (and pays the oracle fees)
2. The feed's update interval expires (if configured)

For production use, you would typically:
- Request updates programmatically
- Pay oracle fees in SOL
- Handle the update transaction in your application

## Resources

- **Switchboard Docs**: https://docs.switchboard.xyz
- **On-Demand Feeds**: https://docs.switchboard.xyz/feeds/on-demand
- **Explorer**: https://explorer.solana.com/?cluster=devnet

## Your Deployed Feed

Feed Address: `ALtJ2EE5AaLorWh8bxbzq1M5c32GifyVZHh3gakGhGYh`

View on Solana Explorer:
https://explorer.solana.com/address/ALtJ2EE5AaLorWh8bxbzq1M5c32GifyVZHh3gakGhGYh?cluster=devnet
