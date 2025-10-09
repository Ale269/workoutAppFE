const fs = require('fs');
const path = require('path');

// Leggi il package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Crea il contenuto del file di configurazione
const appInfoContent = `// Questo file viene generato automaticamente dal build script
// Le informazioni provengono dal package.json

export const APP_INFO = {
  version: '${packageJson.version}',
  name: '${packageJson.name}',
  buildDate: '${new Date().toISOString()}'
};
`;

// Scrivi il file di configurazione
const outputPath = path.join(__dirname, '..', 'src', 'app', 'core', 'config', 'app-info.config.ts');

// Assicurati che la directory esista
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, appInfoContent);

console.log('✅ app-info.config.ts generato con successo');
console.log(`📦 Versione: ${packageJson.version}`);
console.log(`📝 Nome: ${packageJson.name}`);
console.log(`🕒 Build Date: ${new Date().toISOString()}`);