import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';

const BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 5 * 60 * 1000;

async function fetchWithCache(url, cacheKey) {
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

export function useMarketData(page = 1, perPage = 20) {
  const { currency } = useApp();
  
  return useQuery({
    queryKey: ['market', currency, page, perPage],
    queryFn: () => fetchWithCache(
      `${BASE_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=7d`,
      `market-${currency}-${page}-${perPage}`
    ),
    staleTime: CACHE_DURATION,
    refetchInterval: 60000,
  });
}

export function useCoinDetail(coinId) {
  return useQuery({
    queryKey: ['coin', coinId],
    queryFn: () => fetchWithCache(
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
    queryFn: () => fetchWithCache(
      `${BASE_URL}/global`,
      'global-data'
    ),
    staleTime: CACHE_DURATION,
    refetchInterval: 60000,
  });
}

export function useCoinsById(ids) {
  const { currency } = useApp();
  
  return useQuery({
    queryKey: ['coins-by-id', ids.join(','), currency],
    queryFn: () => fetchWithCache(
      `${BASE_URL}/coins/markets?vs_currency=${currency}&ids=${ids.join(',')}&sparkline=true&price_change_percentage=7d`,
      `coins-${ids.join(',')}-${currency}`
    ),
    enabled: ids.length > 0,
    staleTime: CACHE_DURATION,
    refetchInterval: 60000,
  });
}

export function useSearchCoins(query) {
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
