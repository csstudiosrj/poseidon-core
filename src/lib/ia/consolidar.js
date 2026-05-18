// src/lib/ia/consolidar.js
const fs = require('fs');
const path = require('path');

const seedsDir = path.join(__dirname, 'seeds');
const outputFile = path.join(__dirname, 'seeds.json');
const allSeeds = [];

function lerDiretorio(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      lerDiretorio(fullPath);
    } else if (entry.name.endsWith('.json')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          allSeeds.push(...data);
        } else {
          allSeeds.push(data);
        }
        console.log(`  ✅ ${path.relative(seedsDir, fullPath)}`);
      } catch (e) {
        console.error(`  ❌ Erro em ${path.relative(seedsDir, fullPath)}: ${e.message}`);
      }
    }
  }
}

console.log('🔍 Lendo seeds...');
lerDiretorio(seedsDir);
fs.writeFileSync(outputFile, JSON.stringify(allSeeds, null, 2));
console.log(`✅ seeds.json consolidado com ${allSeeds.length} projetos.`);