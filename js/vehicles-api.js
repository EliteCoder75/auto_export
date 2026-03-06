/**
 * AUTO EXPORT — API véhicules
 * Charge les véhicules depuis Netlify Functions
 */

const _cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 min

async function loadFromAPI(collection) {
    const url = `/.netlify/functions/vehicles?collection=${collection}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return data.vehicles || [];
    } catch {
        return [];
    }
}

async function getAllVehicles(collection = 'neufs') {
    const now = Date.now();
    if (_cache[collection] && (now - _cache[collection].ts < CACHE_TTL)) {
        return _cache[collection].data;
    }
    const vehicles = await loadFromAPI(collection);
    _cache[collection] = { data: vehicles, ts: now };
    return vehicles;
}

async function getFeaturedVehicles(limit = 6) {
    const neufs     = await getAllVehicles('neufs');
    const occasions = await getAllVehicles('occasions');

    const all = [
        ...neufs.filter(v => v.disponibilite !== 'vendu').map(v => ({ ...v, collection: 'neufs' })),
        ...occasions.filter(v => v.disponibilite !== 'vendu').map(v => ({ ...v, collection: 'occasions' }))
    ];

    // Mélanger et limiter
    return all.sort(() => Math.random() - 0.5).slice(0, limit);
}
