/**
 * AUTO EXPORT — Script de build
 * Copie _vehicules-neufs/ et _vehicules-occasions/ dans la fonction Netlify
 */

const fs   = require('fs');
const path = require('path');

const FUNCTION_DIR = path.join(__dirname, '../netlify/functions/vehicles');
const COLLECTIONS  = ['_vehicules-neufs', '_vehicules-occasions'];

console.log('📋 AUTO EXPORT — Copie des véhicules vers la fonction Netlify...\n');

let total = 0;

COLLECTIONS.forEach(collectionDir => {
    const source      = path.join(__dirname, '..', collectionDir);
    const destination = path.join(FUNCTION_DIR, collectionDir);

    if (!fs.existsSync(source)) {
        console.log(`⚠️  ${collectionDir} introuvable — ignoré.`);
        return;
    }

    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source).filter(f => f.endsWith('.md'));
    console.log(`📂 ${collectionDir} — ${files.length} fichier(s):`);

    files.forEach(file => {
        fs.copyFileSync(path.join(source, file), path.join(destination, file));
        console.log(`   ✅ ${file}`);
        total++;
    });
    console.log('');
});

console.log(`✨ Build terminé — ${total} véhicule(s) copié(s).`);
