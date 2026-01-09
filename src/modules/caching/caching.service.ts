import { prisma } from "../../config/prisma";
import type { UpdateCacheSettingsInput } from "./caching.validation";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheSettings {
  enabled: boolean;
  productCacheTTL: number;
  categoryCacheTTL: number;
  analyticsCacheTTL: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private defaultSettings: CacheSettings = {
    enabled: true,
    productCacheTTL: 15,
    categoryCacheTTL: 30,
    analyticsCacheTTL: 5,
  };

  constructor() {
    this.cache = new Map();
    setInterval(() => this.cleanupExpiredEntries(), 60000);
  }

  async getSettings(): Promise<CacheSettings> {
    try {
      const settings = await prisma.settings.findUnique({
        where: { key: 'cache_settings' },
      });
      return (settings?.value as unknown as CacheSettings) || this.defaultSettings;
    } catch (error) {
      console.error('Error fetching cache settings:', error);
      return this.defaultSettings;
    }
  }

  async updateSettings(data: UpdateCacheSettingsInput, performedBy: string): Promise<CacheSettings> {
    const currentSettings = await this.getSettings();
    const newSettings: CacheSettings = {
      enabled: data.enabled !== undefined ? data.enabled : currentSettings.enabled,
      productCacheTTL: data.productCacheTTL !== undefined ? data.productCacheTTL : currentSettings.productCacheTTL,
      categoryCacheTTL: data.categoryCacheTTL !== undefined ? data.categoryCacheTTL : currentSettings.categoryCacheTTL,
      analyticsCacheTTL: data.analyticsCacheTTL !== undefined ? data.analyticsCacheTTL : currentSettings.analyticsCacheTTL,
    };

    await prisma.settings.upsert({
      where: { key: 'cache_settings' },
      create: { key: 'cache_settings', value: newSettings as any },
      update: { value: newSettings as any },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'USER',
        entityId: 'cache_settings',
        performedBy,
        actorType: 'ADMIN',
        before: currentSettings as any,
        after: newSettings as any,
      },
    });

    if (!newSettings.enabled) {
      this.clearAll();
    }

    return newSettings;
  }

  async get<T>(key: string): Promise<T | null> {
    const settings = await this.getSettings();
    if (!settings.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(
    key: string,
    data: T,
    cacheType: 'product' | 'category' | 'analytics' = 'product'
  ): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.enabled) return;

    let ttl: number;
    switch (cacheType) {
      case 'product':
        ttl = settings.productCacheTTL * 60 * 1000;
        break;
      case 'category':
        ttl = settings.categoryCacheTTL * 60 * 1000;
        break;
      case 'analytics':
        ttl = settings.analyticsCacheTTL * 60 * 1000;
        break;
      default:
        ttl = 15 * 60 * 1000;
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  deleteByPrefix(prefix: string): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    });
  }

  clearAll(): void {
    this.cache.clear();
  }

  clearProductCache(): void {
    this.deleteByPrefix('product:');
  }

  clearCategoryCache(): void {
    this.deleteByPrefix('category:');
  }

  clearAnalyticsCache(): void {
    this.deleteByPrefix('analytics:');
  }

  async getStats(): Promise<{
    enabled: boolean;
    totalEntries: number;
    productEntries: number;
    categoryEntries: number;
    analyticsEntries: number;
    totalSizeBytes: number;
  }> {
    const settings = await this.getSettings();
    const keys = Array.from(this.cache.keys());

    return {
      enabled: settings.enabled,
      totalEntries: this.cache.size,
      productEntries: keys.filter((k) => k.startsWith('product:')).length,
      categoryEntries: keys.filter((k) => k.startsWith('category:')).length,
      analyticsEntries: keys.filter((k) => k.startsWith('analytics:')).length,
      totalSizeBytes: this.estimateCacheSize(),
    };
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keys = Array.from(this.cache.keys());

    keys.forEach((key) => {
      const entry = this.cache.get(key);
      if (entry && now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }

  private estimateCacheSize(): number {
    let size = 0;
    this.cache.forEach((entry) => {
      const jsonString = JSON.stringify(entry.data);
      size += jsonString.length * 2;
    });
    return size;
  }
}

const cacheManager = new CacheManager();

export const CachingService = {
  getSettings: () => cacheManager.getSettings(),
  updateSettings: (data: UpdateCacheSettingsInput, performedBy: string) => 
    cacheManager.updateSettings(data, performedBy),
  getStats: () => cacheManager.getStats(),
  clearAll: () => cacheManager.clearAll(),
  clearProductCache: () => cacheManager.clearProductCache(),
  clearCategoryCache: () => cacheManager.clearCategoryCache(),
  clearAnalyticsCache: () => cacheManager.clearAnalyticsCache(),
  get: <T>(key: string) => cacheManager.get<T>(key),
  set: <T>(key: string, data: T, cacheType?: 'product' | 'category' | 'analytics') => 
    cacheManager.set(key, data, cacheType),
  delete: (key: string) => cacheManager.delete(key),
};
