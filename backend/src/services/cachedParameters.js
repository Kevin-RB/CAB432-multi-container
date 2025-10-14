import { PARAMETERS } from './paramenter-manager.js';
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
        console.log('✅ Cache service enabled');
    } catch (error) {
        console.warn('⚠️  Cache service import failed, falling back to direct calls:', error.message);
    }
}

// Generic cached parameter function
async function cachedParameter(parameterName, getter, ttlSeconds = 1800) {
    if (!CACHE_ENABLED || !getCachedValue) {
        // Direct call without caching
        return await getter();
    }

    const cacheKey = `param_${parameterName}`;
    
    // Check to see if the parameter is in the cache
    const value = await getCachedValue(cacheKey);
    if (value !== null) {
        return value;
    }
    console.log(`Parameter cache miss for: ${parameterName}`);

    // Cache doesn't have the value, so get it from AWS Parameter Store
    const fetchedValue = await getter();
    
    // Cache the parameter with TTL
    await setCachedValue(cacheKey, fetchedValue, ttlSeconds);
    return fetchedValue;
}

// Cached parameter functions
export async function cachedAWSUserPoolId() {
    return cachedParameter('AWS_USER_POOL_ID', PARAMETERS.AWS_USER_POOL_ID, 3600);
}

export async function cachedAWSClientId() {
    return cachedParameter('AWS_CLIENT_ID', PARAMETERS.AWS_CLIENT_ID, 3600);
}

export async function cachedAWSRegion() {
    return cachedParameter('AWS_REGION', PARAMETERS.AWS_REGION, 3600);
}

export async function cachedCognitoPoolDomain() {
    return cachedParameter('COGNITO_POOL_DOMAIN', PARAMETERS.COGNITO_POOL_DOMAIN, 3600);
}

export async function cachedDomainName() {
    return cachedParameter('DOMAIN_NAME', PARAMETERS.DOMAIN_NAME, 1800);
}

export async function cachedAWSS3BucketName() {
    return cachedParameter('AWS_S3_BUCKET_NAME', PARAMETERS.AWS_S3_BUCKET_NAME, 3600);
}

export async function cachedDynamoDBTableName() {
    return cachedParameter('DYNAMODB_TABLE_NAME', PARAMETERS.DYNAMODB_TABLE_NAME, 3600);
}

export async function cachedQUTUsername() {
    return cachedParameter('QUT_USERNAME', PARAMETERS.QUT_USERNAME, 3600);
}

export async function cachedAWSClientSecretName() {
    return cachedParameter('AWS_CLIENT_SECRET_NAME', PARAMETERS.AWS_CLIENT_SECRET_NAME, 3600);
}

export async function cachedSQSTesseractUrl() {
    return cachedParameter('SQS_TESSERACT_URL', PARAMETERS.SQS_TESSERACT_URL, 3600);
}

export async function cachedSQSOLLamaUrl() {
    return cachedParameter('SQS_OLLAMA_URL', PARAMETERS.SQS_OLLAMA_URL, 3600);
}

// Cache invalidation
export async function invalidateParameterCache(parameterName) {
    if (!CACHE_ENABLED || !deleteCachedValue) {
        console.log(`Cache invalidation skipped (cache disabled): ${parameterName}`);
        return;
    }
    
    const cacheKey = `param_${parameterName}`;
    await deleteCachedValue(cacheKey);
    console.log(`Invalidated cache for parameter: ${parameterName}`);
}

// Invalidate all parameters
export async function invalidateAllParameters() {
    if (!CACHE_ENABLED) {
        console.log('Cache invalidation skipped (cache disabled)');
        return;
    }

    const parameterNames = [
        'AWS_USER_POOL_ID',
        'AWS_CLIENT_ID', 
        'AWS_REGION',
        'COGNITO_POOL_DOMAIN',
        'DOMAIN_NAME',
        'AWS_S3_BUCKET_NAME',
        'DYNAMODB_TABLE_NAME',
        'QUT_USERNAME',
        'AWS_CLIENT_SECRET_NAME',
        'SQS_TESSERACT_URL',
        'SQS_OLLAMA_URL'
    ];

    for (const param of parameterNames) {
        await invalidateParameterCache(param);
    }
}

// Warm up cache by pre-loading commonly used parameters
export async function warmUpCache() {
    if (!CACHE_ENABLED) {
        console.log('⚠️  Cache warm-up skipped (cache disabled) - parameters will be fetched on demand');
        return;
    }

    console.log('Warming up parameter cache...');
    try {
        await Promise.all([
            cachedAWSUserPoolId(),
            cachedAWSClientId(),
            cachedAWSRegion(),
            cachedCognitoPoolDomain(),
            cachedDomainName(),
            cachedAWSS3BucketName(),
            cachedDynamoDBTableName(),
            cachedQUTUsername(),
            cachedAWSClientSecretName(),
            cachedSQSTesseractUrl(),
            cachedSQSOLLamaUrl()
        ]);
        console.log('✅ Parameter cache warmed up successfully');
    } catch (error) {
        console.error('❌ Error warming up cache:', error);
    }
}