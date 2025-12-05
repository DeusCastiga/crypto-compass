import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { large: string; small: string; thumb: string };
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    high_24h: Record<string, number>;
    low_24h: Record<string, number>;
    price_change_24h: number;
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
  };
  description: { en: string };
}

export interface GlobalData {
  data: {
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
  };
}

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  return data;
}

export function useMarketData(page: number = 1, perPage: number = 20) {
  const { currency } = useApp();
  
  return useQuery({
    queryKey: ['market', currency, page, perPage],
    queryFn: () => fetchWithCache<CoinMarket[]>(
      `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`,
      `market-${currency}-${page}-${perPage}`
    ),
    staleTime: CACHE_DURATION,
    refetchInterval: 60000,
  });
}

export function useCoinDetail(coinId: string | null) {
  return useQuery({
    queryKey: ['coin', coinId],
    queryFn: () => fetchWithCache<CoinDetail>(
      `${BASE_URL}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`,
      `coin-${coinId}`
    ),
    enabled: !!coinId,
    staleTime: CACHE_DURATION,
  });
}

export function useGlobalData() {
  return useQuery({
    queryKey: ['global'],
    queryFn: () => fetchWithCache<GlobalData>(
      `${BASE_URL}/global`,
      'global-data'
    ),
    staleTime: CACHE_DURATION,
    refetchInterval: 60000,
  });
}

export function useCoinsById(ids: string[]) {
  const { currency } = useApp();
  
  return useQuery({
    queryKey: ['coins-by-id', ids.join(','), currency],
    queryFn: () => fetchWithCache<CoinMarket[]>(
      `${BASE_URL}/coins/markets?vs_currency=${currency}&ids=${ids.join(',')}&sparkline=true&price_change_percentage=7d`,
      `coins-${ids.join(',')}-${currency}`
    ),
    enabled: ids.length > 0,
    staleTime: CACHE_DURATION,
    refetchInterval: 60000,
  });
}

export function useSearchCoins(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await fetch(`${BASE_URL}/search?query=${query}`);
      const data = await response.json();
      return data.coins?.slice(0, 10) || [];
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });
}
