import { SECRET_STORE } from './secrets-manager.js';

// Cache configuration - set to false to disable caching
const CACHE_ENABLED = false;

// Conditional import of cache functions
let getCachedValue, setCachedValue, deleteCachedValue;
if (CACHE_ENABLED) {
    try {
        const cacheModule = await import('./cache.js');
        getCachedValue = cacheModule.getCachedValue;
        setCachedValue = cacheModule.setCachedValue;
        deleteCachedValue = cacheModule.deleteCachedValue;
        console.log('✅ Secrets cache service enabled');
    } catch (error) {
        console.warn('⚠️  Secrets cache service import failed, falling back to direct calls:', error.message);
    }
}

// Generic cached secret function
async function cachedSecret(secretName, getter, ttlSeconds = 3600) {
    if (!CACHE_ENABLED || !getCachedValue) {
        // Direct call without caching
        return await getter();
    }

    const cacheKey = `secret_${secretName}`;
    
    // Check to see if the secret is in the cache
    const value = await getCachedValue(cacheKey);
    if (value !== null) {
        return value;
    }
    console.log(`Secret cache miss for: ${secretName}`);

    // Cache doesn't have the value, so get it from AWS Secrets Manager
    const fetchedValue = await getter();
    
    // Cache the secret with TTL
    await setCachedValue(cacheKey, fetchedValue, ttlSeconds);
    return fetchedValue;
}

// Cached secret functions
export async function cachedAWSClientSecret() {
    return cachedSecret('AWS_CLIENT_SECRET', SECRET_STORE.AWS_CLIENT_SECRET, 3600);
}

export async function cachedYouTubeAPIKey() {
    return cachedSecret('YOUTUBE_API_KEY', SECRET_STORE.YOUTUBE_API_KEY, 3600);
}

// Cache invalidation
export async function invalidateSecretCache(secretName) {
    if (!CACHE_ENABLED || !deleteCachedValue) {
        console.log(`Cache invalidation skipped (cache disabled): ${secretName}`);
        return;
    }

    const cacheKey = `secret_${secretName}`;
    await deleteCachedValue(cacheKey);
    console.log(`Invalidated cache for secret: ${secretName}`);
}

// Invalidate all secrets
export async function invalidateAllSecrets() {
    if (!CACHE_ENABLED) {
        console.log('Cache invalidation skipped (cache disabled)');
        return;
    }

    const secretNames = [
        'AWS_CLIENT_SECRET',
        'YOUTUBE_API_KEY'
    ];

    for (const secret of secretNames) {
        await invalidateSecretCache(secret);
    }
}

// Warm up cache by pre-loading commonly used secrets
export async function warmUpSecretsCache() {
    if (!CACHE_ENABLED) {
        console.log('⚠️  Secrets cache warm-up skipped (cache disabled) - secrets will be fetched on demand');
        return;
    }

    console.log('Warming up secrets cache...');
    try {
        await Promise.all([
            cachedYouTubeAPIKey(),
            // Only cache AWS_CLIENT_SECRET if needed frequently
        ]);
        console.log('✅ Secrets cache warmed up successfully');
    } catch (error) {
        console.error('❌ Error warming up secrets cache:', error);
    }
}
