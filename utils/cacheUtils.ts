
/**
 * Production-ready caching utilities for offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

const CACHE_PREFIX = '@cardrop_cache:';

/**
 * Set cache with optional expiration
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds?: number
): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    };

    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify(entry)
    );
  } catch (error) {
    console.error('[CacheUtils] Error setting cache:', error);
  }
}

/**
 * Get cache if not expired
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      await removeCache(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('[CacheUtils] Error getting cache:', error);
    return null;
  }
}

/**
 * Remove cache entry
 */
export async function removeCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error('[CacheUtils] Error removing cache:', error);
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('[CacheUtils] Error clearing cache:', error);
  }
}

/**
 * Get cache age in seconds
 */
export async function getCacheAge(key: string): Promise<number | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!cached) {
      return null;
    }

    const entry: CacheEntry<any> = JSON.parse(cached);
    return Math.floor((Date.now() - entry.timestamp) / 1000);
  } catch (error) {
    console.error('[CacheUtils] Error getting cache age:', error);
    return null;
  }
}

/**
 * Check if cache exists and is valid
 */
export async function isCacheValid(key: string): Promise<boolean> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    
    if (!cached) {
      return false;
    }

    const entry: CacheEntry<any> = JSON.parse(cached);

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('[CacheUtils] Error checking cache validity:', error);
    return false;
  }
}
