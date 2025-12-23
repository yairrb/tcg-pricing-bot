/**
 * Pokémon TCG API card data structure
 */
export interface PokemonCard {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  number: string;
  set: {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    releaseDate: string;
    images: {
      symbol: string;
      logo: string;
    };
  };
  images: {
    small: string;
    large: string;
  };
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      holofoil?: PriceData;
      reverseHolofoil?: PriceData;
      normal?: PriceData;
      '1stEditionHolofoil'?: PriceData;
      '1stEditionNormal'?: PriceData;
      unlimited?: PriceData;
      unlimitedHolofoil?: PriceData;
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
    };
  };
  rarity?: string;
  artist?: string;
}

export interface PriceData {
  low: number | null;
  mid: number | null;
  high: number | null;
  market: number | null;
  directLow: number | null;
}

export interface SearchResponse {
  data: PokemonCard[];
  page: number;
  pageSize: number;
  count: number;
  totalCount: number;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
