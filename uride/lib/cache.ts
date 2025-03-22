import AsyncStorage from "@react-native-async-storage/async-storage"
import { CACHE_CONFIG } from "./config"

/**
 * Cache utility for storing and retrieving data
 */

// Cache keys
const CACHE_KEYS = {
  SEARCH_RESULTS: "cache:search_results:",
  ROUTES: "cache:routes:",
  LOCATIONS: "cache:locations:",
  USER_PREFERENCES: "cache:user_preferences",
}

// Cache item interface
interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

/**
 * Set an item in the cache
 */ // Cache item interface
export const setCacheItem = async <T>(key: string, data: T, ttl: number)
: Promise<void> =>
{
  try {
    const timestamp = Date.now()
    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      expiry: timestamp + ttl,
    }

    await AsyncStorage.setItem(key, JSON.stringify(cacheItem))
  } catch (error) {
    console.error("Error setting cache item:", error)
  }
}

/**
 * Get an item from the cache
 * Returns null if item doesn't exist or is expired
 */
export const getCacheItem = async <T>(key: string)
: Promise<T | null> =>
{
  try {
    const item = await AsyncStorage.getItem(key)

    if (!item) return null

    const cacheItem: CacheItem<T> = JSON.parse(item)
    const now = Date.now()

    // Check if item is expired
    if (now > cacheItem.expiry) {
      // Remove expired item
      await AsyncStorage.removeItem(key)
      return null
    }

    return cacheItem.data
  } catch (error) {
    console.error("Error getting cache item:", error)
    return null
  }
}

/**
 * Remove an item from the cache
 */
export const removeCacheItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key)
  } catch (error) {
    console.error("Error removing cache item:", error)
  }
}

/**
 * Clear all cache items with a specific prefix
 */
export const clearCacheByPrefix = async (prefix: string): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const keysToRemove = keys.filter((key) => key.startsWith(prefix))

    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove)
    }
  } catch (error) {
    console.error("Error clearing cache by prefix:", error)
  }
}

/**
 * Cache search results
 */
export const cacheSearchResults = async (query: string, results: any[]): Promise<void> => {
  const key = `${CACHE_KEYS.SEARCH_RESULTS}${query.toLowerCase()}`
  await setCacheItem(key, results, CACHE_CONFIG.SEARCH_RESULTS_TTL)
}

/**
 * Get cached search results
 */
export const getCachedSearchResults = async (query: string): Promise<any[] | null> => {
  const key = `${CACHE_KEYS.SEARCH_RESULTS}${query.toLowerCase()}`
  return getCacheItem<any[]>(key)
}

/**
 * Cache route
 */
export const cacheRoute = async (origin: string, destination: string, route: any): Promise<void> => {
  const key = `${CACHE_KEYS.ROUTES}${origin}_${destination}`
  await setCacheItem(key, route, CACHE_CONFIG.ROUTES_TTL)
}

/**
 * Get cached route
 */
export const getCachedRoute = async (origin: string, destination: string): Promise<any | null> => {
  const key = `${CACHE_KEYS.ROUTES}${origin}_${destination}`
  return getCacheItem<any>(key)
}

/**
 * Cache location
 */
export const cacheLocation = async (address: string, coordinates: any): Promise<void> => {
  const key = `${CACHE_KEYS.LOCATIONS}${address.toLowerCase()}`
  await setCacheItem(key, coordinates, CACHE_CONFIG.LOCATION_TTL)
}

/**
 * Get cached location
 */
export const getCachedLocation = async (address: string): Promise<any | null> => {
  const key = `${CACHE_KEYS.LOCATIONS}${address.toLowerCase()}`
  return getCacheItem<any>(key)
}

/**
 * Save user preferences
 */
export const saveUserPreferences = async (preferences: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
  } catch (error) {
    console.error("Error saving user preferences:", error)
  }
}

/**
 * Get user preferences
 */
export const getUserPreferences = async (): Promise<any | null> => {
  try {
    const preferences = await AsyncStorage.getItem(CACHE_KEYS.USER_PREFERENCES)
    return preferences ? JSON.parse(preferences) : null
  } catch (error) {
    console.error("Error getting user preferences:", error)
    return null
  }
}

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    await clearCacheByPrefix(CACHE_KEYS.SEARCH_RESULTS)
    await clearCacheByPrefix(CACHE_KEYS.ROUTES)
    await clearCacheByPrefix(CACHE_KEYS.LOCATIONS)
  } catch (error) {
    console.error("Error clearing all cache:", error)
  }
}

