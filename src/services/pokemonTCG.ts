import fetch from 'node-fetch';
import { PokemonCard, SearchResponse } from '../types/pokemon.js';
import { TTLCache } from '../utils/cache.js';

/**
 * Client for interacting with the Pokémon TCG API
 */
export class PokemonTCGClient {
  private readonly baseURL = 'https://api.pokemontcg.io/v2';
  private readonly apiKey?: string;
  
  // Cache: search query -> search results (5 min TTL)
  private searchCache: TTLCache<PokemonCard[]>;
  
  // Cache: card ID -> card details (10 min TTL)
  private cardCache: TTLCache<PokemonCard>;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    this.searchCache = new TTLCache<PokemonCard[]>(5 * 60 * 1000); // 5 minutes
    this.cardCache = new TTLCache<PokemonCard>(10 * 60 * 1000); // 10 minutes
  }

  /**
   * Search for cards by name
   */
  async searchCards(query: string, limit: number = 25): Promise<PokemonCard[]> {
    const cacheKey = `search:${query}:${limit}`;
    
    // Check cache first
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Build search query
    const searchQuery = `name:"${query}*"`;
    const params = new URLSearchParams({
      q: searchQuery,
      pageSize: limit.toString(),
      orderBy: 'set.releaseDate'
    });

    const response = await this.makeRequest<SearchResponse>(`/cards?${params}`);
    const cards = response.data;

    // Cache the result
    this.searchCache.set(cacheKey, cards);

    return cards;
  }

  /**
   * Get a specific card by ID
   */
  async getCard(cardId: string): Promise<PokemonCard> {
    const cacheKey = `card:${cardId}`;
    
    // Check cache first
    const cached = this.cardCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await this.makeRequest<{ data: PokemonCard }>(`/cards/${cardId}`);
    const card = response.data;

    // Cache the result
    this.cardCache.set(cacheKey, card);

    return card;
  }

  /**
   * Make a request to the API
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      search: this.searchCache.getStats(),
      card: this.cardCache.getStats()
    };
  }
}
