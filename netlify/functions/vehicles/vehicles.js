/**
 * Netlify Function - API pour charger les véhicules depuis le CMS
 * Endpoint: /.netlify/functions/vehicles
 *
 * Note: Le dossier _vehicules doit être inclus dans le bundle de cette fonction
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * Parse le front matter YAML d'un fichier markdown
 */
function parseFrontMatter(content) {
    try {
        const { data } = matter(content);
        return data;
    } catch (e) {
        return null;
    }
}

/**
 * Normaliser les données d'un véhicule
 */
function normalizeVehicle(data) {
    return {
        id: data.id || '',
        brand: (data.brand || '').toUpperCase(),
        model: data.model || '',
        finition: data.finition || '',
        year: data.year || new Date().getFullYear(),
        price: data.price || 0,
        fuel: data.fuel || '',
        transmission: data.transmission || '',
        motor: data.motor || data.power || '',
        exterior_color: data.exterior_color || '',
        interior_color: data.interior_color || '',
        disponibilite: data.disponibilite || 'stock',
        destination: data.destination || '',
        image: data.image || '',
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
        description: data.description || data.desc || ''
    };
}

/**
 * Handler principal de la fonction
 */
exports.handler = async (event, context) => {
    try {
        // Autoriser CORS
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Content-Type': 'application/json'
        };

        // Gérer les requêtes OPTIONS (preflight)
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: ''
            };
        }

        // Le dossier _vehicules est maintenant dans le même dossier que cette fonction
        const vehiclesDir = path.join(__dirname, '_vehicules');

        console.log('📂 Chemin recherché:', vehiclesDir);

        // Vérifier que le dossier existe
        if (!fs.existsSync(vehiclesDir)) {
            console.error('❌ Dossier _vehicules introuvable');
            console.error('__dirname:', __dirname);
            console.error('Contenu du dossier:', fs.readdirSync(__dirname));

            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    error: 'Dossier _vehicules introuvable',
                    __dirname: __dirname,
                    content: fs.readdirSync(__dirname)
                })
            };
        }

        // Lire tous les fichiers .md
        const files = fs.readdirSync(vehiclesDir)
            .filter(file => file.endsWith('.md'));

        console.log(`📂 ${files.length} fichiers markdown trouvés`);

        const vehicles = [];

        // Parser chaque fichier
        for (const file of files) {
            try {
                const filePath = path.join(vehiclesDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const data = parseFrontMatter(content);

                if (data) {
                    const vehicle = normalizeVehicle(data);
                    vehicles.push(vehicle);
                    console.log(`✅ ${vehicle.brand} ${vehicle.model} (ID: ${vehicle.id})`);
                } else {
                    console.log(`⚠️ Impossible de parser: ${file}`);
                }
            } catch (error) {
                console.error(`❌ Erreur lecture fichier ${file}:`, error.message);
            }
        }

        // Trier par ID
        vehicles.sort((a, b) => a.id - b.id);

        console.log(`✨ ${vehicles.length} véhicules chargés avec succès`);

        // Retourner les véhicules
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                count: vehicles.length,
                vehicles: vehicles
            })
        };

    } catch (error) {
        console.error('❌ Erreur serveur:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
