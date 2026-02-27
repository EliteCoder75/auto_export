/**
 * Script pour copier le dossier _vehicules dans la fonction Netlify
 * Exécuté pendant le build Netlify
 */

const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '../_vehicules');
const destination = path.join(__dirname, '../netlify/functions/vehicles/_vehicules');

console.log('📋 Copie du dossier _vehicules vers la fonction...');
console.log('Source:', source);
console.log('Destination:', destination);

// Si le dossier source n'existe pas, on quitte sans erreur
if (!fs.existsSync(source)) {
    console.log('⚠️  Dossier _vehicules introuvable - aucun véhicule à copier.');
    process.exit(0);
}

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
}

// Lire tous les fichiers .md
const files = fs.readdirSync(source).filter(f => f.endsWith('.md'));

console.log(`📂 ${files.length} fichiers à copier`);

// Copier chaque fichier
files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(destination, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ ${file}`);
});

console.log('✨ Copie terminée!');