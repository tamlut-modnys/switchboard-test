import { Connection, PublicKey } from "@solana/web3.js";
import { getDefaultQueue, PullFeed } from "@switchboard-xyz/on-demand";

// The feed address we just created
const FEED_ADDRESS = "ALtJ2EE5AaLorWh8bxbzq1M5c32GifyVZHh3gakGhGYh";

// Solana devnet RPC URL
const solanaRpcUrl = "https://api.devnet.solana.com";

console.log("Reading BTC Price Feed from Switchboard...\n");

// Get the queue (which sets up the program)
const queue = await getDefaultQueue(solanaRpcUrl);

// Load the feed using the program from the queue
const feedPubkey = new PublicKey(FEED_ADDRESS);
const feed = new PullFeed(queue.program, feedPubkey);
await feed.loadData();

// Get the feed data
const feedData = feed.data;

console.log("=== Feed Information ===");
console.log(`Feed Address: ${feedPubkey.toString()}`);
console.log(`Feed Name: BTC Price Feed`);
console.log();

console.log("=== Configuration ===");
console.log(`Queue: ${feedData.queue.toString()}`);
console.log(`Max Variance: ${feedData.maxVariance}`);
console.log(`Min Responses: ${feedData.minResponses}`);
console.log(`Min Sample Size: ${feedData.minSampleSize}`);
console.log(`Max Staleness: ${feedData.maxStaleness} slots`);
console.log();

console.log("=== Current Value ===");
try {
  const value = feedData.value();
  console.log(`BTC Price: $${value.toFixed(2)}`);
  console.log(`Last Update Slot: ${feedData.result.slot}`);
  console.log(`Number of Successes: ${feedData.result.numSuccess}`);

  // Calculate age
  const currentSlot = await connection.getSlot();
  const ageInSlots = currentSlot - Number(feedData.result.slot);
  const ageInSeconds = ageInSlots * 0.4; // ~0.4 seconds per slot on Solana

  console.log(`Data Age: ${ageInSlots} slots (~${ageInSeconds.toFixed(1)} seconds)`);
  console.log();

  // Check if stale
  if (ageInSlots > feedData.maxStaleness) {
    console.log("⚠️  WARNING: Feed data is stale!");
  } else {
    console.log("✅ Feed data is fresh");
  }
} catch (error) {
  console.log("No value available yet - feed hasn't been updated by oracles");
  console.log("This is normal for a newly created feed.");
}

console.log();
console.log("=== Feed Hash (IPFS) ===");
console.log(`0x${Buffer.from(feedData.feedHash).toString("hex")}`);

console.log("\n=== View on Explorer ===");
console.log(`https://explorer.solana.com/address/${feedPubkey.toString()}?cluster=devnet`);
