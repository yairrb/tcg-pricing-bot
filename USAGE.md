# Bot Usage Examples

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`
   - Add your Discord bot token and client ID
   - (Optional) Add Pokémon TCG API key

3. **Build the Bot**:
   ```bash
   npm run build
   ```

4. **Start the Bot**:
   ```bash
   npm start
   ```

## Command Usage

### `/price [card name]`

Search for a Pokémon card and get its current market price.

**Example 1: Single Match**
```
/price Charizard VMAX
```
Returns: Directly shows the card with pricing information

**Example 2: Multiple Matches**
```
/price Pikachu
```
Returns: Shows a dropdown menu with up to 25 matching cards. Select your desired card to see its pricing.

## What the Bot Shows

For each card, the bot displays:
- **Card Name** and **Image**
- **Set Information**: Name, series, and release date
- **Card Number**: Position in the set (e.g., 4/102)
- **Rarity**: If available
- **TCGPlayer Prices**: Market, low, mid, and high prices for different variants:
  - Holofoil
  - Reverse Holofoil
  - Normal
  - 1st Edition variants
  - Unlimited variants
- **Cardmarket Prices**: Average, trend, and low prices (if available)
- **Direct Link**: Click the card title to view on TCGPlayer

## Cache Behavior

The bot uses intelligent caching to reduce API calls:

- **Search Cache**: 5 minutes
  - Repeated searches for the same card name return instantly
  
- **Card Detail Cache**: 10 minutes
  - Card pricing data is cached for 10 minutes
  - Reduces rate limiting issues
  - Keeps prices reasonably up-to-date

## Example Flow

1. User types: `/price Charizard`
2. Bot searches Pokémon TCG API for "Charizard"
3. Bot finds 25+ matching cards
4. Bot shows dropdown with options like:
   - "Charizard - Base Set (4/102 • Rare Holo)"
   - "Charizard VMAX - Darkness Ablaze (20/189 • Rare Holo VMAX)"
   - etc.
5. User selects desired card from dropdown
6. Bot fetches full card details (or retrieves from cache)
7. Bot displays beautiful embed with:
   - Card image
   - Set information
   - All available pricing data
   - Link to TCGPlayer

## Bot Permissions Required

When inviting the bot to your server, ensure it has these permissions:
- Send Messages
- Embed Links
- Use Slash Commands
- View Channels

## Troubleshooting

**Bot doesn't respond to commands:**
- Ensure the bot is online (check console for "Logged in as..." message)
- Verify slash commands are registered (happens automatically on startup)
- Check bot has proper permissions in the channel

**"No cards found" error:**
- Try a more specific or different search term
- Card names are searched with partial matching (e.g., "Char" finds "Charizard")

**Rate limiting errors:**
- The bot has built-in caching to prevent this
- Consider adding a Pokémon TCG API key to `.env` for higher limits
- Get your API key at https://dev.pokemontcg.io/

## Technical Notes

- Built with TypeScript for type safety
- Uses Discord.js v14
- Modular architecture with clean separation of concerns
- All prices are in USD from TCGPlayer and Cardmarket
- Prices update based on cache TTL settings
