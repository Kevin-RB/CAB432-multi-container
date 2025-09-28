import Memcached from "memcached";
import { promisify } from "node:util";

// Global memcached instance
let memcached = false;

function connectToMemcached() {
    const memcachedUrl = 'n12112798-cosmic-cache.km2jzi.cfg.apse2.cache.amazonaws.com:11211';
    memcached = new Memcached(memcachedUrl);
    
    memcached.on("failure", (details) => {
        console.log("Memcached server failure: ", details);
    });

    // Promisify functions for convenience (same as your lecturer's approach)
    memcached.aGet = promisify(memcached.get);
    memcached.aSet = promisify(memcached.set);
    memcached.aDel = promisify(memcached.del);
    
    console.log('Memcached connected to:', memcachedUrl);
}

async function getCachedValue(key) {
    if (!memcached) connectToMemcached();
    
    try {
        const value = await memcached.aGet(key);
        if (value) {
            console.log(`Cache HIT for key: ${key}`);
            return JSON.parse(value);
        }
        console.log(`Cache MISS for key: ${key}`);
        return null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

async function setCachedValue(key, value, ttlSeconds = 1800) {
    if (!memcached) connectToMemcached();
    
    try {
        await memcached.aSet(key, JSON.stringify(value), ttlSeconds);
        console.log(`Cache SET for key: ${key}, TTL: ${ttlSeconds}s`);
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

async function deleteCachedValue(key) {
    if (!memcached) connectToMemcached();
    
    try {
        await memcached.aDel(key);
        console.log(`Cache DELETE for key: ${key}`);
    } catch (error) {
        console.error('Cache delete error:', error);
    }
}

export {
    connectToMemcached,
    getCachedValue,
    setCachedValue,
    deleteCachedValue
};