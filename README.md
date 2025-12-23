# Pokémon TCG Pricing Bot

A Discord bot that fetches Pokémon Trading Card Game card prices using the public [Pokémon TCG API](https://pokemontcg.io/).

## Features

- 🔍 **Card Search**: Search for Pokémon cards by name
- 💰 **Price Information**: Get current market prices from TCGPlayer and Cardmarket
- 📋 **Multi-Select UI**: When multiple cards match, select the exact one from a dropdown menu
- ⚡ **Smart Caching**: In-memory TTL caching reduces API calls and rate-limit risks
- 🎨 **Rich Embeds**: Beautiful Discord embeds with card images and detailed pricing

## Prerequisites

- Node.js 20 or higher
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- (Optional) Pokémon TCG API Key for higher rate limits ([dev.pokemontcg.io](https://dev.pokemontcg.io/))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yairrb/tcg-pricing-bot.git
cd tcg-pricing-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Discord bot token and client ID:
```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
# Optional: Add API key for higher rate limits
POKEMON_TCG_API_KEY=your_api_key_here
```

## Getting Your Discord Bot Credentials

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under the bot's username, click "Reset Token" to get your `DISCORD_TOKEN`
5. Go to "OAuth2" → "General" to find your `DISCORD_CLIENT_ID`
6. Go to "OAuth2" → "URL Generator":
   - Select scopes: `bot`, `applications.commands`
   - Select bot permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
   - Copy the generated URL and use it to invite the bot to your server

## Usage

### Build and Run

```bash
# Build the TypeScript code
npm run build

# Start the bot
npm start

# Or build and run in one command
npm run dev
```

### Discord Commands

Once the bot is running and invited to your server, use:

- `/price [card name]` - Search for a Pokémon card and get its price

**Example:**
```
/price charizard
```

If multiple cards match, you'll see a dropdown menu to select the specific card you want. The bot will then display:
- Card name and image
- Set information
- Rarity
- Current market prices (TCGPlayer and/or Cardmarket)
- Price variants (Holofoil, Reverse Holo, Normal, etc.)

## Architecture

The bot is built with clean, modular architecture:

```
src/
├── commands/       # Discord slash commands
│   └── price.ts
├── services/       # External API clients
│   └── pokemonTCG.ts
├── types/          # TypeScript interfaces
│   └── pokemon.ts
├── utils/          # Utility functions
│   ├── cache.ts    # TTL caching implementation
│   └── embeds.ts   # Discord embed formatters
└── index.ts        # Main bot entry point
```

### Caching Strategy

The bot implements two-level in-memory TTL caching:

1. **Search Cache** (5 minutes TTL): Caches search query results
2. **Card Cache** (10 minutes TTL): Caches individual card details

This reduces API calls and helps avoid rate limiting while keeping data reasonably fresh.

## Development

```bash
# Lint the code
npm run lint

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

## Technologies Used

- **TypeScript** - Type-safe development
- **Discord.js v14** - Discord bot framework
- **Node.js 20** - Runtime environment
- **Pokémon TCG API** - Card data and pricing source

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.