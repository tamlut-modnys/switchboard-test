use anchor_lang::prelude::*;
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

declare_id!("4VHsa4FYFjf7t2CEcBkhGdUEdcUMgf2DfsFHJ5w1Yr5v");

#[program]
pub mod btc_reader {
    use super::*;

    /// Read the current BTC price from the Switchboard feed
    pub fn read_btc_price(ctx: Context<ReadBtcPrice>) -> Result<()> {
        // Load the Switchboard feed account data
        let feed_account = &ctx.accounts.feed;
        let feed = PullFeedAccountData::parse(feed_account.data.borrow()).unwrap();

        // Get the current value from the feed
        let value = feed.value();

        msg!("Current BTC Price: ${}", value);
        msg!("Feed Address: {}", feed_account.key());

        // You can also get additional metadata
        msg!("Last Update Slot: {}", feed.result.slot);
        msg!("Min Responses: {}", feed.min_responses);
        msg!("Max Variance: {}", feed.max_variance);

        Ok(())
    }

    /// Read BTC price and store it in an account
    pub fn save_btc_price(ctx: Context<SaveBtcPrice>) -> Result<()> {
        let feed_account = &ctx.accounts.feed;
        let feed = PullFeedAccountData::parse(feed_account.data.borrow()).unwrap();

        let price_data = &mut ctx.accounts.price_data;
        price_data.price = feed.value();
        price_data.last_update = Clock::get()?.unix_timestamp;

        msg!("Saved BTC Price: ${}", price_data.price);
        msg!("Timestamp: {}", price_data.last_update);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ReadBtcPrice<'info> {
    /// CHECK: The Switchboard feed account
    pub feed: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SaveBtcPrice<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + 8 + 8,
        seeds = [b"price_data"],
        bump
    )]
    pub price_data: Account<'info, PriceData>,
    /// CHECK: The Switchboard feed account
    pub feed: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PriceData {
    pub price: f64,
    pub last_update: i64,
}
