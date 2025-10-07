import { getCachedValue, setCachedValue, deleteCachedValue } from './cache.js';
import { SECRET_STORE } from './secrets-manager.js';

// Generic cached secret function (same pattern as cachedParameter)
async function cachedSecret(secretName, getter, ttlSeconds = 3600) {
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
    return cachedSecret('AWS_CLIENT_SECRET', SECRET_STORE.AWS_CLIENT_SECRET, 3600); // 1 hour
}

export async function cachedYouTubeAPIKey() {
    return cachedSecret('YOUTUBE_API_KEY', SECRET_STORE.YOUTUBE_API_KEY, 3600); // 1 hour
}

// Cache invalidation
export async function invalidateSecretCache(secretName) {
    const cacheKey = `secret_${secretName}`;
    await deleteCachedValue(cacheKey);
    console.log(`Invalidated cache for secret: ${secretName}`);
}

// Invalidate all secrets
export async function invalidateAllSecrets() {
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
    console.log('Warming up secrets cache...');
    try {
        await Promise.all([
            cachedYouTubeAPIKey(),
            // Only cache AWS_CLIENT_SECRET if needed frequently
        ]);
        console.log('Secrets cache warmed up successfully');
    } catch (error) {
        console.error('Error warming up secrets cache:', error);
    }
}
