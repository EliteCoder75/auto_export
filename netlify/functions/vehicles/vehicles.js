/**
 * AUTO EXPORT — Netlify Function
 * Endpoint : /.netlify/functions/vehicles?collection=neufs|occasions
 *
 * Lit les fichiers markdown dans _vehicules-neufs/ ou _vehicules-occasions/
 * (copiés par le script de build)
 */

const fs     = require('fs');
const path   = require('path');
const matter = require('gray-matter');

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

function normalizeVehicle(data, collection) {
    const base = {
        id:             data.id || '',
        brand:          (data.brand || '').toUpperCase(),
        model:          data.model || '',
        finition:       data.finition || '',
        year:           data.year || '',
        price:          data.price || 0,
        fuel:           data.fuel || '',
        transmission:   data.transmission || '',
        motor:          data.motor || '',
        exterior_color: data.exterior_color || '',
        interior_color: data.interior_color || '',
        disponibilite:  data.disponibilite || 'stock',
        image:          data.image || '',
        gallery:        Array.isArray(data.gallery) ? data.gallery : [],
        desc:           data.desc || data.description || '',
        collection
    };
    if (collection === 'occasions') {
        base.kilometrage = data.kilometrage || 0;
        base.type        = data.type || 'france';
    }
    return base;
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: HEADERS, body: '' };
    }

    try {
        const params     = new URLSearchParams(event.queryStringParameters || {});
        const collection = params.get('collection') || 'neufs';
        const dirName    = collection === 'occasions' ? '_vehicules-occasions' : '_vehicules-neufs';
        const vehiclesDir = path.join(__dirname, dirName);

        if (!fs.existsSync(vehiclesDir)) {
            return {
                statusCode: 200,
                headers: HEADERS,
                body: JSON.stringify({ success: true, count: 0, vehicles: [] })
            };
        }

        const files = fs.readdirSync(vehiclesDir).filter(f => f.endsWith('.md'));
        const vehicles = [];

        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(vehiclesDir, file), 'utf8');
                const { data } = matter(content);
                if (data && data.id) {
                    vehicles.push(normalizeVehicle(data, collection));
                }
            } catch (e) {
                console.error(`Erreur lecture ${file}:`, e.message);
            }
        }

        vehicles.sort((a, b) => String(a.id).localeCompare(String(b.id)));

        return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({ success: true, count: vehicles.length, vehicles })
        };

    } catch (err) {
        return {
            statusCode: 500,
            headers: HEADERS,
            body: JSON.stringify({ success: false, error: err.message })
        };
    }
};
