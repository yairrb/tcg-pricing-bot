import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType
} from 'discord.js';
import { PokemonTCGClient } from '../services/pokemonTCG.js';
import { createCardEmbed, createSearchResultsEmbed, createErrorEmbed } from '../utils/embeds.js';

// Configuration constants
const SELECTION_TIMEOUT_MS = 60_000; // 60 seconds for user to select a card

export const data = new SlashCommandBuilder()
  .setName('price')
  .setDescription('Search for a Pokémon card and get its price')
  .addStringOption(option =>
    option
      .setName('card')
      .setDescription('The name of the card to search for')
      .setRequired(true)
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
  tcgClient: PokemonTCGClient
): Promise<void> {
  const query = interaction.options.getString('card', true);

  // Defer the reply since API calls might take time
  await interaction.deferReply();

  try {
    // Search for cards
    const cards = await tcgClient.searchCards(query, 25);

    if (cards.length === 0) {
      await interaction.editReply({
        embeds: [createErrorEmbed(`No cards found matching "${query}"`)]
      });
      return;
    }

    // If only one card found, show it directly
    if (cards.length === 1) {
      const cardEmbed = createCardEmbed(cards[0]);
      await interaction.editReply({ embeds: [cardEmbed] });
      return;
    }

    // Multiple cards found - show dropdown
    const options = cards.slice(0, 25).map(card => 
      new StringSelectMenuOptionBuilder()
        .setLabel(`${card.name} - ${card.set.name}`)
        .setDescription(`${card.number}/${card.set.printedTotal} • ${card.set.series}${card.rarity ? ` • ${card.rarity}` : ''}`)
        .setValue(card.id)
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('card_select')
      .setPlaceholder('Select a card')
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const response = await interaction.editReply({
      embeds: [createSearchResultsEmbed(query, cards.length)],
      components: [row]
    });

    // Wait for user selection
    try {
      const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: SELECTION_TIMEOUT_MS
      });

      collector.on('collect', async (selectInteraction) => {
        if (selectInteraction.user.id !== interaction.user.id) {
          await selectInteraction.reply({
            content: 'This menu is not for you!',
            ephemeral: true
          });
          return;
        }

        const selectedCardId = selectInteraction.values[0];
        
        // Fetch the full card details
        const card = await tcgClient.getCard(selectedCardId);
        const cardEmbed = createCardEmbed(card);

        await selectInteraction.update({
          embeds: [cardEmbed],
          components: [] // Remove the dropdown
        });

        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          // Timeout - remove components
          await interaction.editReply({
            components: []
          });
        }
      });

    } catch (error) {
      console.error('Error handling selection:', error);
      await interaction.editReply({
        embeds: [createErrorEmbed('An error occurred while processing your selection.')],
        components: []
      });
    }

  } catch (error) {
    console.error('Error executing price command:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    await interaction.editReply({
      embeds: [createErrorEmbed(`Failed to search for cards: ${errorMessage}`)]
    });
  }
}
