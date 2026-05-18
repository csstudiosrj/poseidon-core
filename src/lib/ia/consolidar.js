// src/lib/ia/consolidar.js
const fs = require('fs');
const path = require('path');

const seedsDir = path.join(__dirname, 'seeds');
const outputFile = path.join(__dirname, 'seeds.json');

const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.json'));
const allSeeds = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(seedsDir, file), 'utf-8');
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      allSeeds.push(...data);
    } else {
      allSeeds.push(data);
    }
  } catch (e) {
    console.error(`Erro no arquivo ${file}: ${e.message}`);
  }
}

fs.writeFileSync(outputFile, JSON.stringify(allSeeds, null, 2));
console.log(`✅ seeds.json consolidado com ${allSeeds.length} projetos.`);