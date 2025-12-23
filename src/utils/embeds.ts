import { EmbedBuilder, APIEmbedField } from 'discord.js';
import { PokemonCard, PriceData } from '../types/pokemon.js';

/**
 * Format price data for display
 */
function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return 'N/A';
  }
  return `$${price.toFixed(2)}`;
}

/**
 * Format a price variant (e.g., Holofoil, Normal)
 */
function formatPriceVariant(name: string, prices: PriceData | undefined): string {
  if (!prices) {
    return '';
  }

  const parts: string[] = [];
  
  if (prices.market !== null && prices.market !== undefined) {
    parts.push(`Market: ${formatPrice(prices.market)}`);
  }
  if (prices.low !== null && prices.low !== undefined) {
    parts.push(`Low: ${formatPrice(prices.low)}`);
  }
  if (prices.mid !== null && prices.mid !== undefined) {
    parts.push(`Mid: ${formatPrice(prices.mid)}`);
  }
  if (prices.high !== null && prices.high !== undefined) {
    parts.push(`High: ${formatPrice(prices.high)}`);
  }

  return parts.length > 0 ? `**${name}**\n${parts.join(' • ')}` : '';
}

/**
 * Create a Discord embed for a Pokémon card with pricing
 */
export function createCardEmbed(card: PokemonCard): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(card.name)
    .setColor(0x0099ff)
    .setThumbnail(card.images.small)
    .setTimestamp();

  // Basic card info
  const fields: APIEmbedField[] = [
    {
      name: 'Set',
      value: `${card.set.name} (${card.set.series})`,
      inline: true
    },
    {
      name: 'Card Number',
      value: `${card.number}/${card.set.printedTotal}`,
      inline: true
    }
  ];

  if (card.rarity) {
    fields.push({
      name: 'Rarity',
      value: card.rarity,
      inline: true
    });
  }

  embed.addFields(fields);

  // TCGPlayer prices
  if (card.tcgplayer?.prices) {
    const priceVariants: string[] = [];

    if (card.tcgplayer.prices.holofoil) {
      const formatted = formatPriceVariant('Holofoil', card.tcgplayer.prices.holofoil);
      if (formatted) priceVariants.push(formatted);
    }
    if (card.tcgplayer.prices.reverseHolofoil) {
      const formatted = formatPriceVariant('Reverse Holo', card.tcgplayer.prices.reverseHolofoil);
      if (formatted) priceVariants.push(formatted);
    }
    if (card.tcgplayer.prices.normal) {
      const formatted = formatPriceVariant('Normal', card.tcgplayer.prices.normal);
      if (formatted) priceVariants.push(formatted);
    }
    if (card.tcgplayer.prices['1stEditionHolofoil']) {
      const formatted = formatPriceVariant('1st Ed Holo', card.tcgplayer.prices['1stEditionHolofoil']);
      if (formatted) priceVariants.push(formatted);
    }
    if (card.tcgplayer.prices.unlimitedHolofoil) {
      const formatted = formatPriceVariant('Unlimited Holo', card.tcgplayer.prices.unlimitedHolofoil);
      if (formatted) priceVariants.push(formatted);
    }
    if (card.tcgplayer.prices.unlimited) {
      const formatted = formatPriceVariant('Unlimited', card.tcgplayer.prices.unlimited);
      if (formatted) priceVariants.push(formatted);
    }

    if (priceVariants.length > 0) {
      embed.addFields({
        name: '💰 TCGPlayer Prices',
        value: priceVariants.join('\n\n') || 'No pricing data available',
        inline: false
      });

      if (card.tcgplayer.url) {
        embed.setURL(card.tcgplayer.url);
      }

      if (card.tcgplayer.updatedAt) {
        embed.setFooter({ 
          text: `Prices updated: ${new Date(card.tcgplayer.updatedAt).toLocaleDateString()}` 
        });
      }
    }
  }

  // Cardmarket prices
  if (card.cardmarket?.prices) {
    const prices = card.cardmarket.prices;
    const priceInfo: string[] = [];

    if (prices.averageSellPrice) {
      priceInfo.push(`Avg: ${formatPrice(prices.averageSellPrice)}`);
    }
    if (prices.trendPrice) {
      priceInfo.push(`Trend: ${formatPrice(prices.trendPrice)}`);
    }
    if (prices.lowPrice) {
      priceInfo.push(`Low: ${formatPrice(prices.lowPrice)}`);
    }

    if (priceInfo.length > 0) {
      embed.addFields({
        name: '🌍 Cardmarket Prices',
        value: priceInfo.join(' • '),
        inline: false
      });
    }
  }

  if (!card.tcgplayer?.prices && !card.cardmarket?.prices) {
    embed.addFields({
      name: '💰 Pricing',
      value: 'No pricing data available for this card',
      inline: false
    });
  }

  return embed;
}

/**
 * Create a simple embed for search results
 */
export function createSearchResultsEmbed(query: string, count: number): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(`Search Results for "${query}"`)
    .setDescription(`Found ${count} matching card(s). Please select one from the dropdown below.`)
    .setColor(0xffa500)
    .setTimestamp();
}

/**
 * Create an error embed
 */
export function createErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('❌ Error')
    .setDescription(message)
    .setColor(0xff0000)
    .setTimestamp();
}
