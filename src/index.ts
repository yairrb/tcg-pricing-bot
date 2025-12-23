import { config } from 'dotenv';
import { Client, GatewayIntentBits, Events, REST, Routes, ChatInputCommandInteraction } from 'discord.js';
import { PokemonTCGClient } from './services/pokemonTCG.js';
import * as priceCommand from './commands/price.js';

// Load environment variables
config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const POKEMON_TCG_API_KEY = process.env.POKEMON_TCG_API_KEY;

if (!DISCORD_TOKEN) {
  console.error('Error: DISCORD_TOKEN is not set in environment variables');
  process.exit(1);
}

if (!DISCORD_CLIENT_ID) {
  console.error('Error: DISCORD_CLIENT_ID is not set in environment variables');
  process.exit(1);
}

// Initialize Pokémon TCG client
const tcgClient = new PokemonTCGClient(POKEMON_TCG_API_KEY);

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Register slash commands
async function registerCommands() {
  const commands = [priceCommand.data.toJSON()];

  const rest = new REST().setToken(DISCORD_TOKEN!);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(DISCORD_CLIENT_ID!),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Handle bot ready event
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Logged in as ${readyClient.user.tag}`);
  console.log(`🤖 Bot is ready and serving ${readyClient.guilds.cache.size} guild(s)`);
  
  // Register commands when bot is ready
  await registerCommands();
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction as ChatInputCommandInteraction;

  if (command.commandName === 'price') {
    try {
      await priceCommand.execute(command, tcgClient);
    } catch (error) {
      console.error('Error executing price command:', error);
      
      const errorMessage = 'There was an error executing this command!';
      
      if (command.replied || command.deferred) {
        await command.editReply(errorMessage);
      } else {
        await command.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
});

// Handle errors
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(DISCORD_TOKEN).catch((error) => {
  console.error('Failed to login:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});
